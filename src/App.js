import React, { useState, useEffect } from "react";
import {
  FormControl,
  MenuItem,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import axios from "axios";

import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import { sortData } from "./util";
import "./App.css";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("Worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCenter, setMapCenter] = useState({ lat: 34.8076, lng: -40.4796 });
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    const getCountryInfo = async () => {
      const res = await axios.get("https://disease.sh/v3/covid-19/all");
      setCountryInfo(res.data);
    };

    getCountryInfo();
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      const res = await axios.get(`https://disease.sh/v3/covid-19/countries`);
      const countries = res.data.map((country) => ({
        name: country.country,
        value: country.countryInfo.iso2,
      }));

      const sortedData = sortData(res.data);
      setTableData(sortedData);
      setMapCountries(res.data);
      setCountries(countries);
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    const res = await axios.get(url);
    setCountry(countryCode);
    setCountryInfo(res.data);
    setMapCenter([res.data.countryInfo.lat, res.data.countryInfo.long]);
    setMapZoom(4);
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID19-TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            title="Coronavirus"
            cases={countryInfo.todayCases}
            total={countryInfo.cases}
          />
          <InfoBox
            title="Recover"
            cases={countryInfo.todayRecovered}
            total={countryInfo.recovered}
          />
          <InfoBox
            title="Deaths"
            cases={countryInfo.todayDeaths}
            total={countryInfo.deaths}
          />
        </div>
        <Map countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>

      <div className="app__right">
        <Card>
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new cases</h3>
            <LineGraph />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
