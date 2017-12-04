import React, {Component} from 'react';
import LoadingIndicator from 'react-loading-indicator';
import {Link} from 'react-router';
import Pagination from './pagination.js';
import axios from 'axios';
const Keycloak = require('keycloak-js');
const logoutUrl =
  'https://auth.healthforge.io/auth/realms/interview/protocol/openid-connect/logout?redirect_uri=http://localhost:4444';

//Main component with allPatients table. Parent of Pagination and LoadingIndicator
//components
class allPatients extends Component {
  constructor() {
    super();
    this.renderPatients = this.renderPatients.bind(this);
    this.onSearchTermChange = this.onSearchTermChange.bind(this);
    this.formatBirthDate = this.formatBirthDate.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
    this.fetchAllPatients = this.fetchAllPatients.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.sortPatients = this.sortPatients.bind(this);
    this.onSortCriteriaChange = this.onSortCriteriaChange.bind(this);
    this.sortAsc = this.sortAsc.bind(this);
    this.sortDesc = this.sortDesc.bind(this);
    this.logout = this.logout.bind(this);

    //Initial state of the component
    this.state = {
      allPatients: [],
      searchTerm: '',
      patients: [],
      allFilteredPatients: null,
      filteredPatients: null,
      sortCriteria: '',
      loggedIn: false,
    };
  }

  //Connnect to keyCloak and fetches patient data
  componentWillMount() {
    const keycloakAuth = Keycloak({
      url: 'https://auth.healthforge.io/auth',
      realm: 'interview',
      clientId: 'interview',
    });
    keycloakAuth
      .init({onLoad: 'login-required'})
      .success(() => {
        this.setState({
          loggedIn: true,
        });
        this.fetchAllPatients(keycloakAuth.token);
      })
      .error(function() {
        window.location.reload();
      });
  }

  //Logs out from keyCloak
  logout = () => {
    window.location = logoutUrl;
  };

  //Formates birth date
  formatBirthDate = date => {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);

    return `${day}/${month}/${year}`;
  };

  //Helper function to render individual record
  renderPatients = patient => {
    let formattedDateOfBirth = this.formatBirthDate(patient.dateOfBirth);
    return (
      <tr key={patient.identifiers[0].value}>
        <td>
          <Link to={`/patient/${patient.identifiers[0].value}`}>
            {patient.lastName}
          </Link>
        </td>
        <td>
          <Link to={`/patient/${patient.identifiers[0].value}`}>
            {patient.firstName}
          </Link>
        </td>
        <td>
          {formattedDateOfBirth}
        </td>
      </tr>
    );
  };

  //Triggers dynamic filtering as user types into input field
  onSearchTermChange = evt => {
    this.setState(
      {
        searchTerm: evt.target.value,
      },
      () => {
        this.filterPatients(this.state.searchTerm);
      }
    );
  };

  //Handles pagination
  handlePageClick = data => {
    const patientsPerPage = 10;
    const page = data.selected;
    const startIndex = page * patientsPerPage;
    const endIndex = page * patientsPerPage + 10;

    let PatientsOnPage;
    if (
      this.state.allFilteredPatients !== null &&
      this.state.allFilteredPatients.length > 0
    ) {
      PatientsOnPage = this.state.allFilteredPatients.slice(
        startIndex,
        endIndex
      );
      this.setState({filteredPatients: PatientsOnPage});
    } else {
      PatientsOnPage = this.state.allPatients.slice(startIndex, endIndex);
      this.setState({patients: PatientsOnPage});
    }
  };

  //Grabs all patients from database and saves it into the application state.
  //All subsequent filtering is done on front end, taking advantage of high speed
  //rendering of React components
  fetchAllPatients = token => {
    axios
      .get('/patient', {
        params: {
          token: token,
        },
      })
      .then(response => {
        this.setState({
          allPatients: response.data.content,
          patients: response.data.content.slice(0, 10),
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  //Resets searchTerm filter to initial state
  resetFilters = () => {
    this.setState({filteredPatients: null});
  };

  //Filters all patients based on lastName, firstName, dateOfBirth and zipCode.
  ///All filtering is done on front end to achieve more flexibility and speed
  filterPatients = searchTerm => {
    let allFilteredPatients = this.state.allPatients.filter(patient => {
      return (
        patient.lastName.includes(searchTerm) ||
        patient.firstName.includes(searchTerm) ||
        patient.dateOfBirth.includes(searchTerm) ||
        patient.addresses[0].zipCode.includes(searchTerm)
      );
    });
    this.setState({
      allFilteredPatients: allFilteredPatients,
      filteredPatients: allFilteredPatients.slice(0, 10),
    });
  };

  //Ascending sorting
  sortAsc = (a, b) => {
    return a < b ? -1 : a > b ? 1 : 0;
  };

  //Descending sorting
  sortDesc = (a, b) => {
    return a < b ? 1 : a > b ? -1 : 0;
  };

  //Sorts patients table (or filetered patients table) depending on different criteria
  sortPatients = evt => {
    evt.preventDefault();
    let sortedPatients;
    let sortedFilteredPatients;

    switch (this.state.sortCriteria) {
      case 'By Last Name Asc':
        sortedPatients = this.state.allPatients.sort((a, b) => {
          return this.sortAsc(a.lastName, b.lastName);
        });
        break;
      case 'By Last Name Desc':
        sortedPatients = this.state.allPatients.sort((a, b) => {
          return this.sortDesc(a.lastName, b.lastName);
        });
        break;
      case 'By First Name Asc':
        sortedPatients = this.state.allPatients.sort((a, b) => {
          return this.sortAsc(a.firstName, b.firstName);
        });
        break;
      case 'By First Name Desc':
        sortedPatients = this.state.allPatients.sort((a, b) => {
          return this.sortDesc(a.firstName, b.firstName);
        });
        break;
      case 'By DOB Asc':
        sortedPatients = this.state.allPatients.sort((a, b) => {
          return this.sortAsc(a.dateOfBirth, b.dateOfBirth);
        });
        break;
      case 'By DOB Desc':
        sortedPatients = this.state.allPatients.sort((a, b) => {
          return this.sortDesc(a.dateOfBirth, b.dateOfBirth);
        });
        break;
    }

    if (this.state.filteredPatients !== null) {
      switch (this.state.sortCriteria) {
        case 'By Last Name Asc':
          sortedFilteredPatients = this.state.allPatients.sort((a, b) => {
            return this.sortAsc(a.lastName, b.lastName);
          });
          break;
        case 'By Last Name Desc':
          sortedFilteredPatients = this.state.allPatients.sort((a, b) => {
            return this.sortDesc(a.lastName, b.lastName);
          });
          break;
        case 'By First Name Asc':
          sortedFilteredPatients = this.state.allPatients.sort((a, b) => {
            return this.sortAsc(a.firstName, b.firstName);
          });
          break;
        case 'By First Name Desc':
          sortedFilteredPatients = this.state.allPatients.sort((a, b) => {
            return this.sortDesc(a.firstName, b.firstName);
          });
          break;
        case 'By DOB Asc':
          sortedFilteredPatients = this.state.allPatients.sort((a, b) => {
            return this.sortAsc(a.dateOfBirth, b.dateOfBirth);
          });
          break;
        case 'By DOB Desc':
          sortedFilteredPatients = this.state.allPatients.sort((a, b) => {
            return this.sortDesc(a.dateOfBirth, b.dateOfBirth);
          });
          break;
      }

      this.setState({
        allFilteredPatients: sortedFilteredPatients,
        filteredPatients: sortedFilteredPatients.slice(0, 10),
      });
    }

    this.setState({
      allPatients: sortedPatients,
      patients: sortedPatients.slice(0, 10),
    });
  };

  //Updates sorting criterium
  onSortCriteriaChange = evt => {
    this.setState({
      sortCriteria: evt.target.value,
    });
  };

  //Renders allPatients component
  render() {
    if (this.state.patients.length === 0) {
      return (
        <div className="flex-container">
          <LoadingIndicator />
        </div>
      );
    } else {
      return (
        <div className="wrapper">
          <div className="flex-container">
            <form onSubmit={this.onSubmitCriteria}>
              <label>Search:&nbsp;&nbsp;</label>
              <input
                className="search_title"
                type="text"
                value={this.state.searchTerm}
                onChange={this.onSearchTermChange}
              />&nbsp;&nbsp;&nbsp;&nbsp;
            </form>

            <button type="submit" onClick={this.resetFilters}>
              Reset
            </button>
          </div>
          <div className="flex-container">
            <form>
              <label>
                Sort by:&nbsp;&nbsp;
                <input
                  list="sorting_options"
                  value={this.state.sortCriteria}
                  onChange={this.onSortCriteriaChange}
                />&nbsp;&nbsp;
              </label>
              <datalist id="sorting_options">
                <option value="By Last Name Asc" />
                <option value="By Last Name Desc" />
                <option value="By First Name Asc" />
                <option value="By First Name Desc" />
                <option value="By DOB Asc" />
                <option value="By DOB Desc" />
              </datalist>
            </form>

            <button type="submit" onClick={this.sortPatients}>
              Submit
            </button>
          </div>
          <table className="table_all_patients">
            <thead>
              <tr>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              {this.state.filteredPatients !== null
                ? this.state.filteredPatients.map(this.renderPatients)
                : this.state.patients.map(this.renderPatients)}
            </tbody>
          </table>
          <Pagination onPageChange={this.handlePageClick} />
          <div className="logout_container">
            <button type="submit" className="logout_link" onClick={this.logout}>
              Log out
            </button>
          </div>
        </div>
      );
    }
  }
}

export default allPatients;
