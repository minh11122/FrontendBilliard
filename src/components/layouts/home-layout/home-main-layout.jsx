import { Outlet } from "react-router-dom";
import { HeaderHome } from "./header-home";
import { FooterHome } from "./footer-home";


export const HomeMainLayout = () => {
    return (
        <>
            <HeaderHome />
            <div>
                <Outlet />
            </div>
            <FooterHome />
        </>
    );
};
