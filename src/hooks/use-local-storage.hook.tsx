import { useState } from "react";
import { CurrentUserService } from "../services";

export const useLocalStorage = (keyName: string, defaultValue: any) => {

    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = localStorage.getItem(keyName);
            if (value) {
                return JSON.parse(value);
            } else {
                localStorage.setItem(keyName, JSON.stringify(defaultValue));
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });

    const setValue = (newValue: any) => {
        try {
            localStorage.setItem(keyName, JSON.stringify(newValue));
        } catch (err) {
            console.log(err);
        }
        setStoredValue(newValue);
        if (keyName === 'user') {
            CurrentUserService.set(newValue);
        }
    };

    return [storedValue, setValue];
};