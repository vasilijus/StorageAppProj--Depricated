# StorageAppProj

#### Phonegap + cordova + apache

Store data to LocalStorage
Such as:
  - Task
  - Description
  - Date
  - Image
  

# Install
```
npm install 
```


## Usage Examples
```
  cordova create myApp org.apache.cordova.myApp myApp
  cordova plugin add cordova-plugin-camera
  cordova platform add android
  cordova plugin add cordova-plugin-camera --nosave
  cordova platform add android --nosave
  cordova requirements android    
  cordova build android --verbose
  cordova run android
  cordova build android --release -- --keystore="..\android.keystore" --storePassword=android --alias=mykey
  cordova config ls
```

## Check which platforms available

$ cordova platform

```
  Installed platforms:
    android broken
    browser broken
  Available platforms: 
    electron ^1.0.0
    ios ^5.0.0
    osx ^5.0.0
    windows ^7.0.0
	
```

---
### Reference

#### [Cordova Site](https://cordova.apache.org/#getstarted)

#### [Ionic Site](https://ionicframework.com/getting-started)

#### [Phonegap](https://phonegap.com/)

#### [Quick Gitignore Generation](https://www.gitignore.io/api/apachecordova)