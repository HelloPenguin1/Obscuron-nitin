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

type BountyProps = {
    onSubmit?: (effort: number, quality: number) => void
    contributor : string
}

export function Bounty({ onSubmit, contributor }: BountyProps) {
    const [effort, setEffort] = useState("")
    const [quality, setQuality] = useState("")
    const [error, setError] = useState("")
    const [isOpen, setIsOpen] = useState(false)

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

        onSubmit?.(effortScore, qualityScore)
        setIsOpen(false)
        setEffort("")
        setQuality("")
        setError("")
    }


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
