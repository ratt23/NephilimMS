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

export const sendLeaveNotification = (doctorName, leaveDate) => {
  const heading = "📅 INFO CUTI DOKTER:";

  // Format date simple
  const dateObj = new Date(leaveDate);
  const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  // Removed explicit 'dr.' prefix because doctorName usually includes it.
  const content = `- ${doctorName} (s.d ${dateStr})`;

  return sendNotification(heading, content);
};
