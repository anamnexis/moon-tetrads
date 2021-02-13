import { months } from '../config';
import { hebcalUrl } from '../config';

const monthToInt = month => {
  const monthLower = month.toLowerCase();
  const letter = monthLower.charAt(0);
  const position =
    months[
      letter !== 'j' && letter !== 'a' && letter !== 'm' ? letter : monthLower
    ];
  return position;
};

const dateTransformations = date => {
  const [year, month, day] = date.split(' ');
  const monthPosition = monthToInt(month);
  return [year, monthPosition, day];
};

const urlToAPI = date => {
  const d = dateTransformations(date);
  return hebcalUrl
    .replace('{year}', d[0])
    .replace('{month}', d[1])
    .replace('{day}', d[2]);
};

const arrayBatches = (ar, batch) =>
  ar.reduce((all, one, i) => {
    const ch = Math.floor(i / batch);
    all[ch] = [].concat(all[ch] || [], one);
    return all;
  }, []);

export { urlToAPI, arrayBatches };
