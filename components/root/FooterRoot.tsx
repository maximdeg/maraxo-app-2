import Link from "next/link";
import React from "react";

const FooterRoot = () => {
    return (
        <footer className="py-5">
            <div className="text-center text-sm">
                <span>
                    @ 2025 Copyright. <Link href="https://www.linkedin.com/in/maxim-degtiarev">Maxim Degtiarev</Link>
                </span>
                <br />
                <Link href={"/admin"}>Admin</Link>
            </div>
        </footer>
    );
};

export default FooterRoot;
