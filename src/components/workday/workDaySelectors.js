import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Select, Form, DatePicker, Row, Col } from "antd";
import { withFormik, Field as FormikField } from "formik";

import { setSelectedTeam, saveTeamsToStore } from "../../actions/teamActions";
import { replaceVehicle } from "../../actions/vehiclesActions";
import { setJourneyCreateDate } from "../../actions/journeyActions";
import { endpoints } from "../../api/endpoints";
import HttpRequest from "../../api/HttpRequest";
import { getOptions, dateFormat, formatDateYYYYMMDD } from "../../utils/common";

const FormItem = Form.Item;
const Option = Select.Option;

const request = new HttpRequest(null);

const WorkDaySelectors = ({
  values,
  setFieldTouched,
  setFieldValue,
  setSelectedTeam,
  teamsData,
  replaceVehicle,
  saveTeamsToStore,
  setJourneyCreateDate,
  journeyCreateDate
}) => {
  // define state for selects
  const [siteDepartments, setSiteDepartments] = useState([]);
  const [workAreas, setWorkAreas] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showSelectors, setShowSelectors] = useState(false);

  useEffect(() => {
    loadWorkAreas();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (values.site && values.workArea) {
      loadTeams();
    }
  }, [values.site, values.workArea]);

  const loadDepartments = () => {
    const requestDeparments = request.fetchData(endpoints.siteDepartment, {});
    requestDeparments
      .then(departments => getOptions(departments.data))
      .then(options => setSiteDepartments(options))
      .catch(error => handleHttpError(error));
  };

  const loadWorkAreas = () => {
    const requestWorkAreas = request.fetchData(endpoints.workArea, {});
    requestWorkAreas
      .then(workAreas => getOptions(workAreas.data))
      .then(options => setWorkAreas(options))
      .catch(error => handleHttpError(error));
  };

  const loadTeams = () => {
    const requestTeams = request.fetchData(
      `${endpoints.team}?Filters=site==${values.site}&workarea==${
        values.workArea
      }&date=${journeyCreateDate}`,
      {}
    );
    requestTeams
      .then(teams => {
        saveTeamsToStore(teams.data);
        return getOptions(teams.data)
      })
      .then(options => setTeams(options))
      .catch(error => console.log(error));
  };

  const handleHttpError = error => {
    console.log("error", error);
  };

  const setSelectedValue = (resource, value) => {
    setFieldValue(resource, value);
  };

  const sendTeamToStore = value => {
    setFieldValue("team", value);
    setSelectedTeam(value);
    if(teamsData.length > 0){
      const vehicleFromTeam = teamsData.find(team => team.id === value);
      replaceVehicle(vehicleFromTeam.vehicle);
    }
  };

  const onChangeDate = value => {
    setJourneyCreateDate(formatDateYYYYMMDD(value));
    setSelectedValue("date", value);
    if(!value){
      setSelectedValue("workArea", null);
      setSelectedValue("site", null);
      setSelectedValue("team", null);
      setShowSelectors(false);
    }else{    
      setShowSelectors(true);
    }
  }

  return (
    <Row gutter={16}>
      <Col md={12} sm={12} xs={24}>
        <FormItem label="Seleccione la fecha">
          <FormikField
            name="date"
            render={({ field }) => (
              <DatePicker
                onChange={value => onChangeDate(value)}
                format={dateFormat}
                style={{width: "100%"}}
              />
            )}
          />
        </FormItem>
      </Col>
      { showSelectors && 
        <>
            <Col md={12} sm={12} xs={24}>
              <FormItem label="Seleccione el departamento">
                <FormikField
                  name="site"
                  render={({ field }) => (
                    <Select
                      {...field}
                      onChange={value => setSelectedValue("site", value)}
                      onBlur={() => setFieldTouched("site", true)}
                      value={values.site}
                      style={{width: "100%"}}
                    >
                      {siteDepartments.map(option => {
                        return (
                          <Option key={option.value} value={option.value}>
                            {option.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                />
              </FormItem>
            </Col>
            <Col md={12} sm={12} xs={24}>
            <FormItem label="Seleccione el área">
                <FormikField
                  name="workArea"
                  render={({ field }) => (
                    <Select
                      {...field}
                      onChange={value => setSelectedValue("workArea", value)}
                      onBlur={() => setFieldTouched("workArea", true)}
                      value={values.workArea}
                      style={{width: "100%"}}
                    >
                      {workAreas.map(option => {
                        return (
                          <Option key={option.value} value={option.value}>
                            {option.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                />
              </FormItem>
            </Col>
            <Col md={12} sm={12} xs={24}>
              <FormItem label="Seleccione el equipo">
                <FormikField
                  name="team"
                  render={({ field }) => (
                    <Select
                      {...field}
                      onChange={value => sendTeamToStore(value)}
                      onBlur={() => setFieldTouched("team", true)}
                      value={values.team}
                      style={{width: "100%"}}
                    >
                      {teams.map(option => {
                        return (
                          <Option key={option.value} value={option.value}>
                            {option.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                />
              </FormItem>
            </Col>
        </>
      }
      </Row>
  );
};


const mapStateToProps = state => {
  const journeyCreateDate = state.journeyInfo.journeyCreateDate;
  const teamsData = state.teamsInfo.teamsData;
  return {
    journeyCreateDate,
    teamsData
  };
};

const WorkDayForm = withFormik({
  mapPropsToValues({ site, workArea, team, date }) {
    return {
      date: date || null,
      site: site || null,
      workArea: workArea || null,
      team: team || null
    };
  }
})(WorkDaySelectors);

export default connect(
  mapStateToProps,
  { setSelectedTeam, setJourneyCreateDate, saveTeamsToStore, replaceVehicle }
)(WorkDayForm);
