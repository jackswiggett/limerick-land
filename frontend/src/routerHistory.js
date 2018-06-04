import createHistory from "history/createBrowserHistory";
import ReactGA from "react-ga";

// Create router history and track with GA
// https://github.com/react-ga/react-ga/issues/122
const history = createHistory();
history.listen((location, action) => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
});

export default history;