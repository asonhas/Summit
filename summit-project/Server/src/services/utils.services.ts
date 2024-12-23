class Utils{
    static generateTaskId() {
        return `TASK${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`;
      }
}

export default Utils;