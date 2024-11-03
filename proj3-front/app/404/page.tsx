"use client";
import { useRouter } from 'next/navigation';

export  default function NotFound() {
    const router = useRouter();
    return (
        <div>
        <h1>404 - Page Not Found</h1>
        <button onClick={() => router.push('/')}>Go back to home</button>
        </div>
    );
}
