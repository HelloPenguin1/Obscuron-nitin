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
import { AlertCircle, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { generateEncryptionArtifacts } from "../arcium/mxe";
import { getProgram } from "../arcium/solanaClient";
import { BN } from "@project-serum/anchor"

type BountyProps = {
    onSubmit?: (effort: number, quality: number) => void
    contributor: string
}

export function Bounty({ onSubmit, contributor }: BountyProps) {
    const [effort, setEffort] = useState("")
    const [quality, setQuality] = useState("")
    const [error, setError] = useState("")
    const [comment, setComment] = useState("");
    const [isOpen, setIsOpen] = useState(false)
    const mxePublicKey = new Uint8Array([]);



    function nonceToBN(nonce: Uint8Array): BN {
        // Read the 16 bytes as a BigInt
        const nonceBigInt = BigInt(`0x${Buffer.from(nonce).toString('hex')}`);
        return new BN(nonceBigInt.toString());
    }


    useEffect(() => {
        setError("")
    }, [isOpen])

    const handleSubmit = () => {
        setError("")

        const effortScore = Number.parseFloat(effort)
        const qualityScore = Number.parseFloat(quality)

        if (!effort || !quality) {
            setError("Please fill in both fields.")
            return
        }

        if (isNaN(effortScore) || isNaN(qualityScore)) {
            setError("Please enter valid numbers.")
            return
        }

        if (effortScore < 0 || effortScore > 10 || qualityScore < 0 || qualityScore > 10) {
            setError("Scores must be between 0 and 10.")
            return
        }
        // BountyHandle();
        onSubmit?.(effortScore, qualityScore)
        setIsOpen(false)
        setEffort("")
        setQuality("")
        setError("")
    }
    // const BountyHandle = async () => {
    //     const length = comment.length;
    //     const inputs = [BigInt(effort), BigInt(quality), BigInt(length)];

    //     if (mxePublicKey.length === 0) {
    //         console.error("MXE public key is not configured. Cannot encrypt.");
    //         setError("Configuration error: MXE public key missing.");
    //         return;
    //     }

    //     try {
    //         const { ciphertext, publicKey, nonce } = generateEncryptionArtifacts(mxePublicKey, inputs);
    //         const program = getProgram();
    //         const computationOffset = new BN([...crypto.getRandomValues(new Uint8Array(8))]);

    //         const nonceBN = nonceToBN(nonce);

    //         const tx = await program.methods
    //             .computeBounty(
    //                 computationOffset,
    //                 Array.from(ciphertext[0]),
    //                 Array.from(ciphertext[1]),
    //                 Array.from(ciphertext[2]),
    //                 Array.from(publicKey),
    //                 nonceBN,
    //             )
    //             .rpc();

    //         console.log("Queued TX:", tx);
    //     } catch (err) {
    //         console.error("Failed to queue bounty computation:", err);
    //         setError("Failed to submit bounty. Check the console for details.");
    //     }
    // };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                    <DollarSign className="h-4 w-4" />
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
                        />
                    </div>

                    {error && (
                        <Alert className="bg-red-950/50 border-red-800">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a] hover:border-gray-500"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} className="bg-white text-black hover:bg-gray-200">
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
