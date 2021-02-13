import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Timeline, Popover, Spin } from 'antd';
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import queue from '../../libs/queue';
import nasa from '../../data';
import { gregToHeb } from '../../services';
import { arrayBatches } from '../../helpers';

// 'T' as we search for Total eclipses
const getTotalEclipses = () =>
  nasa
    .filter(e => e[6] && e[6].includes('T'))
    .map(e => ({ count: parseInt(e[0]), date: e[1] }));

const getTetrads = totalEclipses => {
  const tetrads = [];
  totalEclipses.forEach(t => {
    const fourth = totalEclipses.find(e => e.count === t.count + 3);
    const third = totalEclipses.find(e => e.count === t.count + 2);
    const second = totalEclipses.find(e => e.count === t.count + 1);
    if (fourth && third && second) {
      tetrads.push(t, second, third, fourth);
    }
  });
  return tetrads;
};

const getHolidaysTetrads = tetrads =>
  tetrads.filter(tetrad =>
    tetrad.every(ecl => ecl.hm === 'Nisan' || ecl.hm === 'Tishrei')
  );

const getYearsBetweenTetrads = tetrads => {
  const diff = [];
  // We get the first eclipse from the first tetrad and then we get the last
  // eclipse from the second one
  for (let i = 0; i < tetrads.length - 1; i++) {
    diff.push(tetrads[i + 1][3].gy - tetrads[i][0].gy);
  }
  return diff;
};

const Tetrads = () => {
  const { Title } = Typography;
  const [tetradsOnHolidays, setTetradsOnHolidays] = useState();
  const [yearsBetweenTetrads, setYearsBetweenTetrads] = useState();
  const [loading, setLoading] = useState(true);
  const yearsLimit = {
    start: parseInt(nasa[0][1].split(' ')[0]),
    end: nasa[nasa.length - 1][1].split(' ')[0]
  };

  const loadData = async () => {
    let tetradsHolidays = JSON.parse(localStorage.getItem('hebDates'));
    if (!tetradsHolidays) {
      const totalEclipses = getTotalEclipses();
      const tetrads = getTetrads(totalEclipses);
      const hebDates = await queue.addAll(
        tetrads.map(tetrad => () => gregToHeb(tetrad.date))
      );
      const batches = arrayBatches(hebDates, 4);
      tetradsHolidays = getHolidaysTetrads(batches);
      localStorage.setItem('hebDates', JSON.stringify(tetradsHolidays));
    }
    setTetradsOnHolidays(tetradsHolidays);
    setYearsBetweenTetrads(getYearsBetweenTetrads(tetradsHolidays));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Title
        style={{ textAlign: 'center', marginTop: '75px', color: '#1890ff' }}
      >
        Moon Tetrads Research
      </Title>
      <Title level={5} style={{ textAlign: 'center', marginBottom: '25px' }}>
        These are the Tetrads found on the Nasa catalog
        <br />
        wich fall on Passover or Sukkot.
        <br /> Hebcal.com is used to find the Jewish holidays.
      </Title>
      {loading ? (
        <Row justify="center" style={{ marginTop: '100px' }}>
          <Spin tip="Getting data from hebcal..." />
        </Row>
      ) : (
        <Row justify="center">
          <Col
            span={16}
            style={{
              backgroundColor: '#fff',
              padding: '25px'
            }}
          >
            <Timeline mode="alternate">
              <Timeline.Item dot={<CloseOutlined />}>
                {yearsLimit.start} BC
              </Timeline.Item>
              {tetradsOnHolidays &&
                yearsBetweenTetrads &&
                tetradsOnHolidays.map((tetrad, idx) => {
                  const items = [];
                  items.push(
                    <Timeline.Item
                      label={`${tetrad[0].gy} & ${tetrad[3].gy} BC`}
                    >
                      <p>
                        <Popover
                          content={
                            <code>
                              {tetrad.map((eclipse, idxEclipse) => (
                                <span key={idxEclipse}>
                                  {`${idxEclipse + 1}º Gregorian: ${
                                    eclipse.gd
                                  }/${new Date(
                                    eclipse.gy,
                                    eclipse.gm - 1,
                                    eclipse.gd
                                  ).toLocaleString('default', {
                                    month: 'long'
                                  })}/${eclipse.gy} & Hebrew: ${eclipse.hd} ${
                                    eclipse.hm
                                  } ${eclipse.hy}`}
                                  <br />
                                </span>
                              ))}
                            </code>
                          }
                          title="Eclipses dates"
                        >
                          <QuestionCircleOutlined
                            style={{ marginRight: '10px', color: '#8c8c8c' }}
                          />
                        </Popover>
                        <b>{`${idx + 1}º Tetrad`}</b>
                      </p>
                    </Timeline.Item>
                  );
                  if (idx < tetradsOnHolidays.length - 1) {
                    items.push(
                      <Timeline.Item
                        dot={`${yearsBetweenTetrads[idx]} Y`}
                        style={{ paddingBottom: '60px' }}
                      ></Timeline.Item>
                    );
                  }
                  return items;
                })}
              <Timeline.Item dot={<CloseOutlined />}>
                {yearsLimit.end} BC
              </Timeline.Item>
            </Timeline>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Tetrads;
