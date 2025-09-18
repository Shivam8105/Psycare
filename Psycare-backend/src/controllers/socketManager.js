import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    console.log("SOMETHING CONNECTED");    
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['*'],
            credentials: true
        }
    });

    //socket connection
    io.on('connection', (socket) => {
        console.log('A user has connected!');
        socket.on("join-call", (path) => {
            if(connections[path] === undefined){
                connections[path] = [];
            }
            connections[path].push(socket.id);   
            timeOnline[socket.id] = new Date();
            //connect with all connections exists in the path
            for(let a=0; a<connections[path].length; a++){
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }
            //send message to every user connected in the network
            if(messages[path] !== undefined){
                for(let a=0; a<messages[path].length; a++){
                    io.to(socket.id).emit("chat message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender']);
                }
            }

        });

        socket.on('signal', (toId, message) => {
            io.to(toId).emit('signal', socket.id, message);
        });

        socket.on('chat message', (data, sender) => {   
            const[matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if(!isFound && roomValue.includes(socket.id)){
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

                //if room found then send message
                if(found === true){
                    if(messages[matchingRoom] === undefined){
                        messages[matchingRoom] = [];
                    }
                    messages[matchingRoom].push({ "data":data, "sender":sender, "sender-id-socket": socket.id });

                    //message will get printed that user will enter with username who has sent that message
                    console.log("message", matchingRoom, ":", sender, data);

                    connections[matchingRoom].forEach(elem => {
                        io.to(elem).emit("chat message", data, sender, socket.id);
                    })
                }
        });

        socket.on('disconnect', () => {
            // console.log('User disconnected');
            var timeDiff = Math.abs(timeOnline[socket.id] - new Date());
            var key
            for(const [k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                for(let a=0; a<v.length; ++a){
                    if(v[a] == socket.id){
                        key = k
                        for(let a=0; a<connections[key].length; ++a){
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }

                        //remove idx of that connection also
                        var idx = connections[key].indexOf(socket.id);
                        connections[key].splice(idx, 1);

                        //if connections are totally empty now, delete that connection array
                        if(connections[key].length == 0){
                            delete connections[key];
                        }
                    }
                }
            }
        });
    })
    return io;
}