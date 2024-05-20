import {useEffect} from "react";
import io from 'socket.io-client';
import { getIpAddress } from "@/libs/utils";

const Home = () => {
    useEffect(() => {
        socketInitializer();
    }, [])
    const socketInitializer = async () => {
        const origin = window.location.origin.split(":3000")[0];
        const location = window.location.href;
        
        const splited_location = location.split("long_lived_token=")
        const long_lived_token = splited_location[1];
        
        const ip = await getIpAddress();
   
        const socket = io(`https://app.replient.ai`);
        socket.on('connect', () => {    
            console.log("connect")
        })
        socket.emit('send_tokens', {
            ip: ip,
            long_lived_token: long_lived_token
        })
    }
    
    return (
        <>
            Saving...
        </>
    )
}

export default Home;