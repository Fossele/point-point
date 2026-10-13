import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socketIOContext.jsx";

export function useCommunication() {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);

    function receiveMessage(message) {
        console.log("message received: ", message)
        setMessages((messages) => [...messages,
            message])
    }

    function sendMessage(message){
        if (!socket) {
            console.warn("Socket is not connected yet. Cannot send message.");
            return;
        }
        console.log("message sent ")
        socket.emit("game.point-capture", message);
    } 


    useEffect(() => {
        if (!socket) return;

        socket.on("game.point-capture", receiveMessage);
        return () => socket.off("game.point-capture", receiveMessage); // clean up function
    }, [socket]);
    

    return {messages, sendMessage}

}