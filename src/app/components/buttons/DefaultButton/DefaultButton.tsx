"use client";
import React from "react";
import styles from './DefaultButton.module.scss';

type Props = {
    text: string;
    onClick?: () => void;
    type?: "submit" | "reset" | "button" | undefined;
    disabled?: boolean;
};
export default function DefaultButton({text, onClick, type, disabled=false }: Props) {

    return (
        <>
            <button
                type={type || "button"}
                onClick={type==="button" ? () => onClick() : ()=> {}}
                className={styles.defaultBtn}
                disabled={disabled}
            >
                {text}
            </button>
        </>
    );
}
