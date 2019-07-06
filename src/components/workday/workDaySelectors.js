import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Select, Form } from "antd";
import { withFormik, Field as FormikField } from "formik";

import { setSelectedTeam } from "../../actions/teamActions";
import { endpoints } from "../../api/endpoints";
import HttpRequest from "../../api/HttpRequest";

const FormItem = Form.Item;
const Option = Select.Option;

const request = new HttpRequest(null);

const WorkDaySelectors = ({
  values,
  setFieldTouched,
  setFieldValue,
  handleSubmit,
  setSelectedTeam
}) => {
  // define state for selects
  const [siteDepartments, setSiteDepartments] = useState([]);
  const [workAreas, setWorkAreas] = useState([]);
  const [teams, setTeams] = useState([]);

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
      `${endpoints.team}?Filters=site==${values.site},workarea==${
        values.workArea
      }`,
      {}
    );
    requestTeams
      .then(teams => getOptions(teams.data))
      .then(options => setTeams(options))
      .catch(error => console.log(error));
  };

  const handleHttpError = error => {
    console.log("error", error);
  };

  const getOptions = options => {
    return options.map(option => {
      return { value: option.id, name: option.name };
    });
  };

  const setSelectedValue = (resource, value) => {
    setFieldValue(resource, value);
  };

  const sendTeamToStore = value => {
    setFieldValue("team", value);
    setSelectedTeam(value);
  };

  return (
    <Form onSubmit={handleSubmit} layout="inline">
      <FormItem label="Seleccione el departamento">
        <FormikField
          name="site"
          render={({ field }) => (
            <Select
              {...field}
              onChange={value => setSelectedValue("site", value)}
              onBlur={() => setFieldTouched("site", true)}
              value={values.site}
              style={{ width: "200px" }}
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
      <FormItem label="Seleccione el área">
        <FormikField
          name="workArea"
          render={({ field }) => (
            <Select
              {...field}
              onChange={value => setSelectedValue("workArea", value)}
              onBlur={() => setFieldTouched("workArea", true)}
              value={values.workArea}
              style={{ width: "200px" }}
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
      <FormItem label="Seleccione el equipo">
        <FormikField
          name="team"
          render={({ field }) => (
            <Select
              {...field}
              onChange={value => sendTeamToStore(value)}
              onBlur={() => setFieldTouched("team", true)}
              value={values.team}
              style={{ width: "200px" }}
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
    </Form>
  );
};

const WorkDayForm = withFormik({
  mapPropsToValues({ site, workArea, team }) {
    return {
      site: site || null,
      workArea: workArea || null,
      team: team || null
    };
  }
})(WorkDaySelectors);

export default connect(
  null,
  { setSelectedTeam }
)(WorkDayForm);