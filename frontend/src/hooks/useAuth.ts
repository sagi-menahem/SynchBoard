// Located at: frontend/src/hooks/useAuth.ts

import { useContext } from "react";
// Update the import path to the new context definition file
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};