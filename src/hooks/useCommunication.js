import { useEffect, useState } from "react";
import { useSocket } from "../context/socketIOContext";

export function useCommunication() {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);

    function receiveMessage(message) {
        setMessages((messages) => [...messages,
            message])
    }

    function sendMessage(message){
        socket.emit("game.point-capture", message);
    } 


    useEffect(() => {
        socket.on("game.point-capture", receiveMessage);
        return () => socket.off("game.point-capture", receiveMessage); // clean up function
    }, []);
    

    return {messages, sendMessage}

}