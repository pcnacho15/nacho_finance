import Link from "next/link"

export const Footer = () => {
    return (
        <>
            <p className="text-base text-center text-muted-foreground font-medium">Design and Developed by <Link href="https://tailwind-admin.com/" target="_blank" className="text-foreground font-normal underline hover:text-muted-foreground" >tailwind-admin.com</Link> </p>
        </>
    )
}