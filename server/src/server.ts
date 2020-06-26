import express from "express";
import cors from 'cors';
import routes from "./routes";
const app = express();
import path from 'path';


// Route: Complete Address of the resource
// Resource: Which entity are we getting access to from the system

// configuration
app.use(cors()); // here you can configure different domains for access
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, "..",'uploads')));
// the virtual name you want for the route
// the directory you're currently in
// .. to go back (like '../')
// the name of the folder where the files are

app.listen('8080');