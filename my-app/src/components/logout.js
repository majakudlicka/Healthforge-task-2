import React, {Component} from 'react';
var Keycloak = require('keycloak-js');

//Logout component
class Logout extends Component {
  constructor() {
    super();
    this.logout = this.logout.bind(this);

    this.state = {
      logoutUrl:
        'https://auth.healthforge.io/auth/realms/interview/protocol/openid-connect/logout?redirect_uri=http://localhost:4444',
      loggedIn: false,
    };
  }

  componentWillMount() {
    var keycloakAuth = Keycloak({
      url: 'https://auth.healthforge.io/auth',
      realm: 'interview',
      clientId: 'interview',
    });
    keycloakAuth.init({onLoad: 'login-required'}).success(() => {
      console.log(keycloakAuth);
      this.setState({
        loggedIn: true,
      });
    });
    // .error(function() {
    //   window.location.reload();
    // });
  }

  logout = () => {
    this.setState(
      {
        loggedIn: false,
      },
      () => {
        window.location = this.state.logoutUrl;
        console.log(this.state);
      }
    );
  };

  render() {
    return (
      <div>
        <button className="logout_link" type="submit" onClick={this.logout}>
          Log out
        </button>
      </div>
    );
  }
}

export default Logout;
