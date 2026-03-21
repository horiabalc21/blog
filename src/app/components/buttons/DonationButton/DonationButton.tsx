"use client";
import React, { useState } from "react";
import styles from './DonationButton.module.scss';
import DonationModal from "@/app/components/modals/DonationModal/DonationModal";

export default function DonationButton() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setShowModal(true)}
                className={styles.donateBtn}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className={styles.donateText}>Support Us</span>
            </button>
            <DonationModal open={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
