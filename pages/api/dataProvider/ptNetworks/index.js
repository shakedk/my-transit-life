import { TransitDataAccess } from '../../../../src/lib/dataAPI/transitDataAccess';

const transitDataAccess = new TransitDataAccess();
export default async (req, res) => {
  try {
    const data = await transitDataAccess.getAvailableNetworks();
    res.status(200).json(data);
  } catch (e) {
    console.log(e)
    res.status(400).end();
  }
};
