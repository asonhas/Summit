import mongoose from "mongoose";
import { teamModel } from "../models/teams.model";

class Utils{
    static generateTaskId(idFor: string) {
      return `${idFor}${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`;
    }

    static async listTeamsForUser(user: string){
      const teams = await teamModel.find({ 
        usersInTeam: { $regex: `(^|,)${user}($|,)`, $options: "i" }
      });
      //const teamsname = teams.map((team)=> team.teamName);
      if(teams){
        return teams;
      }else{
        return [];
      }
    }

    static connectWithFallback = async() =>{
      const { MONGO_URI, MONGO_CONTAINER_URI } = process.env;
      if(!MONGO_URI && !MONGO_CONTAINER_URI){
        throw new Error('No MongoDB connection strings provided in env.');
      }

      // ---------- 1. Try the primary connection ----------
      if (MONGO_CONTAINER_URI){
        try {
          // Important if the first attempt partially opened a connection
          await mongoose.disconnect().catch(() => {}); // ignore “not connected” errors
          //console.log(`Trying fallback Mongo URI: ${MONGO_CONTAINER_URI}`);
          await mongoose.connect(MONGO_CONTAINER_URI);
          console.log('✅ Connected to MongoDB1');
          return;          
        } catch (err) {
          //console.error('❌  Fallback connection failed:', err);
        }
      }

      // ---------- 2. Try the fallback connection ----------
      if (MONGO_URI){
        try {
          //console.log(`Trying primary Mongo URI: ${MONGO_URI}`);
          await mongoose.connect(MONGO_URI);
          console.log('✅ Connected to MongoDB2');
          return; // we’re done
        } catch (err) {
          //console.error('❌  Primary connection failed:', err);
        }
      }

        console.error('❌  All MongoDB connection attempts failed. Exiting.');
        process.exit(1);      
    }
}

export default Utils;