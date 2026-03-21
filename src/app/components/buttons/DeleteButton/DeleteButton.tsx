"use client";
import React from "react";
import styles from './DeleteButton.module.scss';

type Props = {
    text: string;
    onClick?: () => void;
    type?: "submit" | "reset" | "button" | undefined;
    disabled?: boolean;
};
export default function DeleteButton({text, onClick, type, disabled=false }: Props) {

    return (
        <>
            <button
                type={type || "button"}
                onClick={type==="button" ? () => onClick() : ()=> {}}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                disabled={disabled}
            >
                {text}
            </button>
        </>
    );
}
