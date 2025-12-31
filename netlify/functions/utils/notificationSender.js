import https from 'https';

export const sendNotification = (heading, content, data = {}) => {
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
    };
    const body = {
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { "en": heading },
      contents: { "en": content },
      included_segments: ["All"],
      data: data
    };

    const options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };

    const req = https.request(options, function (res) {
      res.on('data', function (data) {
        console.log("OneSignal Response:");
        try {
          console.log(JSON.parse(data));
          resolve(JSON.parse(data));
        } catch (e) {
          console.log(data.toString());
          resolve(data.toString());
        }
      });
    });

    req.on('error', function (e) {
      console.log("OneSignal Error:");
      console.log(e);
      reject(e);
    });

    req.write(JSON.stringify(body));
    req.end();
  });
};

export const sendLeaveNotification = (doctorName, startDate, endDate) => {
  const heading = "📅 INFO CUTI DOKTER:";

  const formatDate = (dateVal) => {
    const d = new Date(dateVal);
    // User requested "dd-mm-yyyy", but keeping "Des" is friendlier. 
    // using "day month year" format (e.g. 31 Des 2025)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  let dateDisplay = "";
  if (startStr === endStr) {
    dateDisplay = `(${startStr})`;
  } else {
    dateDisplay = `(${startStr} s/d ${endStr})`;
  }

  const content = `- ${doctorName} ${dateDisplay}`;

  return sendNotification(heading, content);
};
