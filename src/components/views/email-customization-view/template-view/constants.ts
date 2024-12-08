export const STANDARD_OTP_TEMPLATE = `<table width="100%">
  <tbody>
    <tr valign="top" style="vertical-align: top">
      <td valign="top" style="word-break: break-word; vertical-align: top">
        <div style="border-bottom: 20px solid transparent"></div>
        <div>
          <div style="margin: 0 auto; min-width: 320px; max-width: 500px">
            <div style="border-collapse: collapse; display: table; width: 100%">
              <div
                style="
                  min-width: 320px;
                  max-width: 500px;
                  display: table-cell;
                  vertical-align: top;
                  width: 500px;
                "
              >
                <div style="width: 100% !important">
                  <div
                    style="
                      border-top: 0px solid transparent;
                      border-left: 0px solid transparent;
                      border-bottom: 0px solid transparent;
                      border-right: 0px solid transparent;
                      padding-top: 0px;
                      padding-bottom: 15px;
                      padding-right: 50px;
                      padding-left: 50px;
                    "
                  >
                    <div
                      align="left"
                      style="padding-right: 0px; padding-left: 0px"
                    >
                      <div style="font-size: 1px; line-height: 10px">
                        &nbsp;
                      </div>
                    </div>
                    <div
                      style="
                        font-family: 'Helvetica Neue', Helvetica, Arial,
                          sans-serif;
                        line-height: 1.8;
                        padding-top: 5px;
                        padding-right: 0px;
                        padding-bottom: 20px;
                        padding-left: 0px;
                      "
                    >
                      <span style="font-size: 34px; font-weight: 700"
                        >{{app.name}}</span
                      >
                      <br />
                      <br />
                      <span style="font-size: 14px; color: #77767a">
                        Login code
                      </span>
                      <br />
                      <span style="font-size: 48px; font-weight: 700"
                        >{{otp}}</span
                      >
                      <br />
                      <br />
                      <span style="font-size: 14px">
                        <span style="color: #000000">
                          This code expires in 20 minutes.
                        </span>
                      </span>
                      <br />
                      <br />
                      <span
                        style="font-size: 14px; line-height: 1.8; margin: 0"
                      >
                        <span style="color: #000000">
                          This login was requested using
                          <strong
                            >{{login.device.browser}},
                            {{login.device.os}}</strong
                          >
                          at <strong>{{login.timestamp}}</strong>
                        </span>
                      </span>
                      <br />
                      <br />
                      <span style="font-size: 14px">
                        <strong>
                          <span style="color: #000000">
                            - {{app.name}} Team
                          </span>
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</table>`;

export const STANDARD_MAGIC_LINK_TEMPLATE = `<table style="width: 100%">
  <tbody style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif">
    <tr valign="top" style="vertical-align: top">
      <td valign="top" style="word-break: break-word; vertical-align: top">
        <div>
          <div style="margin: 36px auto; min-width: 320px; max-width: 500px">
            <div style="border-collapse: collapse; display: table; width: 100%">
              <div style="padding: 0 50px 15px 50px">
                <div style="line-height: 1.8">
                  <span style="font-size: 34px; font-weight: 700"
                    >{{app.name}}</span
                  >
                </div>

                <div style="padding: 15px 0">
                  <div
                    style="
                      line-height: 1.6;
                      font-family: 'Helvetica Neue', Helvetica, Arial,
                        sans-serif;
                    "
                  >
                    <span style="font-size: 14px; margin: 0">
                      Click the button below to log in to
                      <strong>{{app.name}}</strong>.
                    </span>
                    <p style="font-size: 14px; line-height: 1.8; margin: 0">
                      This button will expire in 20 minutes.
                    </p>
                  </div>
                </div>

                <div style="padding: 10px 0">
                  <a href="{{magic_link}}" target="_blank">
                    <div
                      style="
                        display: inline-block;
                        background-color: #6851ff;
                        border-radius: 7px;
                        padding-top: 15px;
                        padding-bottom: 15px;
                        line-height: 1.5;
                        padding-left: 30px;
                        padding-right: 30px;
                        font-size: 18px;
                        color: #ffffff;
                        cursor: pointer;
                      "
                    >
                      <strong>Log in to {{app.name}}</strong>
                    </div>
                  </a>
                </div>

                <div style="padding-top: 20px">
                  <div
                    style="
                      line-height: 1.4;
                      font-family: 'Helvetica Neue', Helvetica, Arial,
                        sans-serif;
                    "
                  >
                    <p style="font-size: 14px; line-height: 1.8; margin: 0">
                      Button not showing?<strong>
                        <a
                          style="
                            color: #6851ff;
                            text-decoration: none;
                            cursor: pointer;
                          "
                          href="{{magic_link}}"
                          target="_blank"
                        >
                          Click here</a
                        ></strong
                      >
                    </p>
                    <br />
                    <p style="font-size: 14px; line-height: 1.8; margin: 0">
                      Confirming this request will securely log you in using
                      <strong>{{user.email}}</strong>.
                    </p>
                    <p style="margin: 0">&nbsp;</p>
                    <p style="font-size: 14px; line-height: 1.8; margin: 0">
                      This login was requested using
                      <strong>Chrome, Mac OS X</strong> at
                      <strong>13:47:29 PDT on October 20, 2023</strong>.
                    </p>
                  </div>
                </div>
                <p style="margin: 0">&nbsp;</p>
                <p style="font-size: 14px; line-height: 1.8; margin: 0">
                  <strong> - {{app.name}} Team </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</table>
`;
