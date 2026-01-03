import https from 'https';

export const sendNotification = (heading, content, data = {}, overrideConfig = {}) => {
  return new Promise((resolve, reject) => {
    // Priority: Override -> Env Var
    const apiKey = overrideConfig.apiKey || process.env.ONESIGNAL_API_KEY;
    const appId = overrideConfig.appId || process.env.ONESIGNAL_APP_ID;

    if (!apiKey || !appId) {
      console.error("OneSignal Credentials missing (Check .env or Settings)");
      reject(new Error("OneSignal Credentials missing"));
      return;
    }

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${apiKey}`
    };
    const body = {
      app_id: appId,
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

export const sendLeaveNotification = (doctorName, startDate, endDate, overrideConfig = {}) => {
  // Check if leave is already expired
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);

  if (end < today) {
    console.log("Notification skipped: Leave period has already ended.");
    return Promise.resolve({ skipped: true, reason: "Expired" });
  }

  const heading = "📅 DOCTOR LEAVE INFO";

  const formatDate = (dateVal) => {
    const d = new Date(dateVal);
    // Use en-GB to match "12 Jan 2024" format used in LeaveManager
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  let dateDisplay = "";
  if (startStr === endStr) {
    dateDisplay = `(${startStr})`;
  } else {
    dateDisplay = `(${startStr} - ${endStr})`;
  }

  const content = `${doctorName} is on leave ${dateDisplay}`;

  return sendNotification(heading, content, {}, overrideConfig);
};
