const api = require('../services/api');
const { config } = require('../config/token.json');

module.exports = {
   async getInformation(req, res) {
      try {
         const response = await api.get(
            `/player/${req.params.id}/chests`,
            config,
         );

         const { data } = response;
         const keys = Object.keys(data);

         const chests = [];

         for (let i = 0; i < keys.length; i += 1) {
            if (keys[i] !== 'upcoming' && data[keys[i]] > 9) {
               chests.push({ chest: keys[i], id: data[keys[i]] });
            }
         }

         chests.sort((a, b) => a.id - b.id);

         return res.status(200).json([
            ...data.upcoming.map((chest, index) => ({
               chest,
               id: index === 0 ? 'Next' : `+${index}`,
            })),
            ...chests.map(chest => ({
               chest: chest.chest,
               id: `+${chest.id}`,
            })),
         ]);
      } catch (exception) {
         return res.status(400).json({ message: exception.message });
      }
   },
};
