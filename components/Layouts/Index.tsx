import { Box } from "@mantine/core";
import { FC } from 'react';
interface Props {
    children: JSX.Element,
}

const Layout:FC<Props> = ({children}) => {
    return (
        <Box>
            {children}
        </Box>
    )
}

export default Layout;