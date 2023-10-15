# iAquaLink API
An API for communicating with iAquaLink WebTouch Systems.

## Getting Started
- Clone the repo.
- Fill in the ENV values. See instructions on obtaining the data below.
- Yarn start/dev.

## Why I made this
I wanted to be able to use Apple Shortcuts to control my iAquaLink WebTouch System. The functionality is present in the app but broken and limited.

## Obtaining ENV values
- Email: your iAquaLink Account Email Address.
- Password: your iAquaLink Account Password.
- Secret: Your "API Token". You may set this to whatever you'd like.
- Action: Your WebTouch Action ID. This may be obtained by going to your iAquaLink Portal (https://iaqualink.zodiacpoolsystems.com/index.html#/owners-center). Next click the name of your device, then on the WebTouch portal copy the actionID URL parameter.
- Device: The name of the device to control, This may be obtained by going to your iAquaLink Portal (https://iaqualink.zodiacpoolsystems.com/index.html#/owners-center) and copy/pasting the device name on the dashboard.

## Apple Shortcuts
- Fetch Pool Temperature: https://www.icloud.com/shortcuts/b3726cf6b08d4d8582224c25319712c2
- Toggle Filter Pump: https://www.icloud.com/shortcuts/23b80db74af64a42866535a8286ec5bd
