import { urlToAPI } from '../helpers';

const gregToHeb = async date => {
  const url = urlToAPI(date);
  let resp;
  await fetch(url)
    .then(response => response.json())
    .then(data => {
      resp = data;
    });
  return resp;
};

export { gregToHeb };
