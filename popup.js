document.addEventListener("DOMContentLoaded", function() {
  var onTabInfoIsLoaded = function(tab) {
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var locationInfo = document.getElementById("locationInfo");
    var connectInput = document.getElementById("connectionPan");
    var messagePan = document.getElementById("messagePan");

    var strContains = function(string, substring) {
      if (!string || !substring) return false;

      return string.indexOf(substring) !== -1;
    };

    var isOnSearchPage = function() {
      return strContains(tab.url, "linkedin.com/sales/search/people");
    };

    var openUrlOnCurrentTab = function(url) {
      chrome.tabs.update({ url: url }, onTabInfoIsLoaded);
    };

    var executeScriptOnCurrentTab = function() {
      // chrome.tabs.executeScript(null, {file : "jquery.js"}, function(){
      //   chrome.tabs.executeScript({
      //     file: "tab.js"
      //   });  
      // })
      chrome.tabs.executeScript({
        file: "tab.js"
      });
    };

    var onTabUpdated = function(tabId, changeInfo, tab) {
      if (changeInfo.status === "loading") {
        onTabInfoIsLoaded(tab);
        if (isOnSearchPage()) {
          executeScriptOnCurrentTab();
          startButton.style.display = "none";
          stopButton.style.display = "block";
        }
      }
    };

    var onClickStartButton = function() {
      startButton.style.display = "none";
      stopButton.style.display = "block";
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
          chrome.tabs.sendMessage(tabs[0].id, {
            action: document.getElementById("m_connect").value, 
            message: document.getElementById("txt_message").value
          });
      });
      executeScriptOnCurrentTab();
      chrome.tabs.onUpdated.addListener(onTabUpdated);
    };

    var onClickStopButton = function() {
      startButton.style.display = "block";
      stopButton.style.display = "none";
      chrome.tabs.onUpdated.removeListener(onTabUpdated);
      chrome.tabs.executeScript({
        code: "running = false"
      });
    };

    if (isOnSearchPage()) {
      locationInfo.innerHTML = "You're on 'Search People' page!";
      startButton.style.display = "block";
      connectInput.style.display = "block";
      messagePan.style.display = "block";
    } else {
      locationInfo.innerHTML =
        "<p>Input correct information on URL link.<br/>LinkedIn Pages to open:</p>" +
        '<div><textarea id="openURLPath" rows="8"></textarea></div>' + 
        '<div><button id="openLinkedInSearchPage"><span>Search<br/>People</span></button></div>';

      startButton.style.display = "none";
      connectInput.style.display = "none";
      messagePan.style.display = "none";

      document
        .getElementById("openLinkedInSearchPage")
        .addEventListener("click", function() {
          var pathURL = document.getElementById("openURLPath").value

          openUrlOnCurrentTab(pathURL);
        });
    }

    stopButton.style.display = "none";
    startButton.addEventListener("click", onClickStartButton);
    stopButton.addEventListener("click", onClickStopButton);
    chrome.tabs.executeScript({
      code: "running = false"
    });
  };

  chrome.tabs.getSelected(onTabInfoIsLoaded);

});
