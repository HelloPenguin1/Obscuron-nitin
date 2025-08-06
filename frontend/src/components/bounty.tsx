// BountyForm.tsx: React Component
"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { AlertCircle, DollarSign, Loader2 } from "lucide-react" // Added Loader2 for loading state
import { Alert, AlertDescription } from "./ui/alert"
import { generateEncryptionArtifacts, decryptBounty } from "../arcium/mxe";
import { getProgram } from "../arcium/solanaClient";
import { BN } from "@project-serum/anchor"
import { getMXEPublicKey } from "@arcium-hq/client"; // Import getMXEPublicKey
import * as anchor from "@project-serum/anchor"; // Import anchor for provider

type BountyProps = {
    onSubmit?: (effort: number, quality: number) => void
    contributor: string
}

export function Bounty({ onSubmit, contributor }: BountyProps) {
    const [effort, setEffort] = useState("")
    const [quality, setQuality] = useState("")
    const [error, setError] = useState("")
    const [comment, setComment] = useState(""); // Keeping comment for UI, but not used in circuit input
    const [isOpen, setIsOpen] = useState(false)
    const [mxePublicKey, setMxePublicKey] = useState<Uint8Array | null>(null); // State to store MXE public key
    const [loadingMxeKey, setLoadingMxeKey] = useState(true); // Loading state for MXE key
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission
    const [decryptedBounty, setDecryptedBounty] = useState<bigint | null>(null); // State for decrypted bounty
    const [encryptionCipher, setEncryptionCipher] = useState<any>(null); // To store the cipher for decryption

    // Helper to convert nonce Uint8Array to Anchor BN
    function nonceToBN(nonce: Uint8Array): BN {
        const nonceBigInt = BigInt(`0x${Buffer.from(nonce).toString('hex')}`);
        return new BN(nonceBigInt.toString());
    }

    // Effect to fetch MXE Public Key on component mount
    useEffect(() => {
        const fetchMxeKey = async () => {
            setLoadingMxeKey(true);
            try {
                const program = getProgram(); // Get program instance to get provider and programId
                const provider = program.provider as anchor.AnchorProvider;
                const programId = program.programId;

                // Use the helper function from Arcium docs (page 43) to fetch MXE public key with retries
                async function getMXEPublicKeyWithRetry(
                    provider: anchor.AnchorProvider,
                    programId: anchor.web3.PublicKey,
                    maxRetries: number = 10,
                    retryDelayMs: number = 500
                ): Promise<Uint8Array> {
                    for (let attempt = 1; attempt <= maxRetries; attempt++) {
                        try {
                            const key = await getMXEPublicKey(provider, programId);
                            if (key) {
                                console.log(`MXE Public Key fetched on attempt ${attempt}`);
                                return key;
                            }
                        } catch (error) {
                            console.warn(`Attempt ${attempt} failed to fetch MXE public key:`, error);
                            if (attempt < maxRetries) {
                                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
                            }
                        }
                    }
                    throw new Error(`Failed to fetch MXE public key after ${maxRetries} attempts.`);
                }

                const key = await getMXEPublicKeyWithRetry(provider, programId);
                setMxePublicKey(key);
            } catch (err) {
                console.error("Error fetching MXE Public Key:", err);
                setError("Failed to load MXE configuration. Check console.");
            } finally {
                setLoadingMxeKey(false);
            }
        };

        fetchMxeKey();
    }, []); // Run once on mount

    // Effect to clear error when dialog opens/closes
    useEffect(() => {
        setError("");
        setDecryptedBounty(null); // Clear previous bounty on dialog change
    }, [isOpen]);

    // Effect to listen for BountyEvent and decrypt
    useEffect(() => {
        const program = getProgram();
        if (!program || !encryptionCipher) return; // Need the cipher to decrypt

        // Listen for the BountyEvent
        const listener = program.addEventListener("BountyEvent", (event, _slot) => {
            console.log("BountyEvent received:", event);
            try {
                // The event.result is the [u8; 32] ciphertext, and event.nonce is [u8; 16]
                // We need to wrap event.result in an array as decryptBounty expects Uint8Array[]
                const decryptedValues = decryptBounty(encryptionCipher, [new Uint8Array(event.result)], new Uint8Array(event.nonce));
                if (decryptedValues.length > 0) {
                    setDecryptedBounty(decryptedValues[0]); // Assuming the first value is the bounty
                    console.log("Decrypted Bounty:", decryptedValues[0].toString());
                }
            } catch (err) {
                console.error("Error decrypting bounty:", err);
                setError("Failed to decrypt bounty. Check console.");
            }
        });

        // Clean up the event listener when the component unmounts or cipher changes
        return () => {
            program.removeEventListener(listener);
        };
    }, [encryptionCipher]); // Re-run if the cipher instance changes

    const handleSubmit = () => {
        setError("");
        setDecryptedBounty(null); // Clear previous bounty

        const effortScore = Number.parseFloat(effort);
        const qualityScore = Number.parseFloat(quality);

        if (!effort || !quality) {
            setError("Please fill in both fields.");
            return;
        }

        if (isNaN(effortScore) || isNaN(qualityScore)) {
            setError("Please enter valid numbers.");
            return;
        }

        if (effortScore < 0 || effortScore > 10 || qualityScore < 0 || qualityScore > 10) {
            setError("Scores must be between 0 and 10.");
            return;
        }

        // Call the async handler
        BountyHandle();
    };

    const BountyHandle = async () => {
        setIsSubmitting(true);
        setError(""); // Clear previous errors
        setDecryptedBounty(null); // Clear previous bounty

        if (!mxePublicKey) {
            setError("MXE public key not loaded. Please try again.");
            setIsSubmitting(false);
            return;
        }

        // Inputs for the circuit: effort and quality (as BigInts)
        const inputs: [bigint, bigint] = [BigInt(effort), BigInt(quality)];

        try {
            // Generate encryption artifacts and store the cipher
            const { ciphertext, publicKey, nonce, cipher } = generateEncryptionArtifacts(mxePublicKey, inputs);
            setEncryptionCipher(cipher); // Store cipher for later decryption

            const program = getProgram();
            const computationOffset = new BN([...crypto.getRandomValues(new Uint8Array(8))]);

            const nonceBN = nonceToBN(nonce);

            // Call the computeBounty instruction with the correct arguments
            const tx = await program.methods
                .bounty( // Changed from computeBounty to bounty as per your Rust program's instruction name
                    computationOffset,
                    Array.from(ciphertext[0]), // Encrypted effort
                    Array.from(ciphertext[1]), // Encrypted quality
                    Array.from(publicKey),      // Client's public key
                    nonceBN,                    // Nonce
                )
                .rpc();

            console.log("Queued TX:", tx);
            onSubmit?.(Number.parseFloat(effort), Number.parseFloat(quality)); // Call onSubmit if provided
            // Do NOT close dialog here, wait for event for actual completion
        } catch (err: any) {
            console.error("Failed to queue bounty computation:", err);
            setError(`Failed to submit bounty: ${err.message || "Unknown error"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="gap-2" disabled={loadingMxeKey}>
                    {loadingMxeKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <DollarSign className="h-4 w-4" />
                    )}
                    Set Bounty
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-gray-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-lg font-medium">
                        <DollarSign className="h-5 w-5" />
                        Set Bounty Scores for {contributor}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-sm">
                        Rate the effort and quality to calculate the bounty amount. Scores range from 0-10.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loadingMxeKey && (
                        <Alert className="bg-blue-950/50 border-blue-800">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                            <AlertDescription className="text-blue-300">Loading MXE configuration...</AlertDescription>
                        </Alert>
                    )}
                    {!loadingMxeKey && !mxePublicKey && (
                        <Alert className="bg-red-950/50 border-red-800">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">
                                Failed to load MXE public key. Cannot proceed.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="effort" className="text-white text-sm font-medium">
                            Effort Score
                        </Label>
                        <Input
                            id="effort"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={effort}
                            onChange={(e) => setEffort(e.target.value)}
                            placeholder="e.g., 8.5"
                            className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-0 rounded-lg"
                            disabled={loadingMxeKey || isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quality" className="text-white text-sm font-medium">
                            Quality Score
                        </Label>
                        <Input
                            id="quality"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            placeholder="e.g., 9.0"
                            className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-0 rounded-lg"
                            disabled={loadingMxeKey || isSubmitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-white text-sm font-medium">
                            Comment (optional)
                        </Label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment about the PR..."
                            className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-0 rounded-lg w-full h-24 p-2"
                            disabled={loadingMxeKey || isSubmitting}
                        />
                    </div>

                    {error && (
                        <Alert className="bg-red-950/50 border-red-800">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                        </Alert>
                    )}

                    {isSubmitting && (
                        <Alert className="bg-yellow-950/50 border-yellow-800">
                            <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                            <AlertDescription className="text-yellow-300">
                                Submitting bounty... Awaiting computation finalization. This may take a moment.
                            </AlertDescription>
                        </Alert>
                    )}

                    {decryptedBounty !== null && (
                        <Alert className="bg-green-950/50 border-green-800">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <AlertDescription className="text-green-300">
                                Bounty Calculated: {decryptedBounty.toString()} Lamports!
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a] hover:border-gray-500"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} className="bg-white text-black hover:bg-gray-200" disabled={loadingMxeKey || isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
