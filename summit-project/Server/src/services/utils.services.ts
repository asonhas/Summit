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
}

export default Utils;