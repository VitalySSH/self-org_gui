import { useLocalStorage } from "../../hooks";

export const Secret = () => {
    const [user, setUser] = useLocalStorage('user', null);

    const handleLogout = () => {
        if (user) setUser(null);
        console.log('Вышел из системы');
    };

    return (
        <div>
            <h1>This is a Secret page</h1>
            <button onClick={ handleLogout }>Выйти</button>
        </div>
    );
};