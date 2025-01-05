import { Schema, model } from "mongoose";

const teamSchema = new Schema({
    teamId: {type: String},
    teamName: {type: String},
    teamTitle: {type: String},
    usersInTeam: {type: String},
});

export const teamModel = model('teams', teamSchema);