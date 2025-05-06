'use client'

import ReduxProvider from "@/providers/redux";
import {ReactNode} from "react";

export default function CustomProvider({children}: {children: ReactNode}) {
    return (
        <ReduxProvider>
            {children}
        </ReduxProvider>
    );
}