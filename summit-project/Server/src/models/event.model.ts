import { Schema, model } from "mongoose";

const eventSchema = new Schema({
    userName: {type: String},
    date: {type: String},
    title: {type: String},
   
});

export const eventModel = model('events', eventSchema);