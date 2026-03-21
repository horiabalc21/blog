"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import styles from './ArticleEditor.module.scss';

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
    ssr: false,
});

interface ArticleEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function ArticleEditor({ value, onChange }: ArticleEditorProps) {
    const [mounted, setMounted] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();
        return result.url;
    };

    const insertImageAtCursor = (imageUrl: string, altText: string = 'image') => {
        const imageMarkdown = `![${altText}](${imageUrl})`;

        // Get current cursor position
        const textarea = document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
            onChange(newValue);

            // Set cursor after inserted image
            setTimeout(() => {
                textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
                textarea.focus();
            }, 0);
        } else {
            // Fallback: append to end
            onChange(value + '\n' + imageMarkdown);
        }
    };

    const handleFileSelect = async (files: FileList) => {
        if (!files.length) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                if (file.type.startsWith('image/')) {
                    const imageUrl = await uploadImage(file);
                    insertImageAtCursor(imageUrl, file.name.split('.')[0]);
                }
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image: ' + (error as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const response = await fetch("/api/upload-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: reader.result }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Upload failed:", errorText);
                    throw new Error("Failed to upload image");
                }

                const data = await response.json();
                if (data.url) {
                    // Insert the uploaded image URL into the editor content
                    const imageMarkdown = `![Image](${data.url})`;
                    onChange(value + "\n" + imageMarkdown);
                }
            } catch (error) {
                alert("Failed to upload image: " + (error instanceof Error ? error.message : String(error)));
            } finally {
                setUploading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    if (!mounted) {
        return <div>Loading editor...</div>;
    }

    return (
        <div className={styles.container}>

            <div className={styles.toolbar}>
                <div className={styles.uploadInputVisible}>
                    <label
                        htmlFor="article-image-upload"
                        className={styles.uploadBtn}
                        style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
                    >
                        📷 {uploading ? 'Uploading...' : 'Upload Image'}
                    </label>
                    <input
                        id="article-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                        }}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                    {uploading && <p className={styles.uploadingText}>Uploading...</p>}
                </div>
            </div>

            <MDEditor
                value={value}
                onChange={(val) => onChange(val || "")}
                height={400}
                data-color-mode="light"
            />

            {uploading && (
                <div className={styles.uploadingOverlay}>
                    Uploading image...
                </div>
            )}
        </div>
    );
}
