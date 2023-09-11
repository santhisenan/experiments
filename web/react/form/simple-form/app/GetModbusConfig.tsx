'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModbusConfiguration() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const router = useRouter();

    const create = async() => {
        // Process data
        router.refresh();
    }
    return(
        <form onSubmit={create}>
            <h3>Input Modbus Configurations</h3>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
            <button type="submit">Create Note</button>  
        </form>
    )
}