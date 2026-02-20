import { createContext } from "react"


export const AppContext = createContext();

const ContextProvider = (props) => {
    const phone = "012345678";
    const address = "Phnom Penh, Cambodia";

    return (
        <AppContext.Provider value={{ phone, address }}>
            {props.children}
        </AppContext.Provider>
    );
}

export default ContextProvider;