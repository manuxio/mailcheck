import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
// import ReactImage from './athenum.png';

const uppercaseFirstLetter = str => str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1); // eslint-disable-line


export default class App extends Component {
  static parseFinalResponse(response) {
    const {
      valid,
      email,
      tests,
      guessedLastName,
      guessedFirstName,
      confidenceLevel,
      webLinks
    } = response;
    const extraClass = valid ? 'alert-success' : 'alert-danger';
    return (
      <div className={`alert ${extraClass}`} role="alert">
        <div className="">
          <div>
            {
              valid
                ? (
                  <h5>
                Hurray!
                    {' '}
                    {email}
                    {' '}
                looks valid.
                  </h5>
                )
                : (
                  <h5>
                Sorry pal!
                    {' '}
                    {email}
                    {' '}
                does not look valid.
                  </h5>
                )
            }
          </div>
          <div>
            <p>
            The following test were run:
              {' '}
              {tests.join(',')}
.
            </p>
            <div className="progress mb-2">
              <div className="progress-bar progress-bar-striped bg-warning" role="progressbar" style={{ width: `${confidenceLevel}%` }}>
                I think I am
                {' '}
                {confidenceLevel}
% correct.
              </div>
            </div>
            {
              (guessedLastName || guessedFirstName)
                ? (
                  <p>
              I also think that this address belongs to someone called:
                    {' '}
                    {`${guessedFirstName} ${guessedLastName}`}
                  </p>
                )
                : null
            }
            {
              webLinks && webLinks.length > 0
                ? (
                  <div>
You can read more about
                    {' '}
                    {' '}
                    {`${guessedFirstName} ${guessedLastName}`}
                    {' '}
here:
                  </div>
                )
                : null
            }
            {
              (webLinks || []).map(link => (
                <li>
                  <a href={link.link} target="_new">
                    {link.title}
                  </a>
                </li>
              ))
            }
          </div>
        </div>
      </div>
    );
  }

  state = {
    // username: null
    fetching: false,
    lastReply: null,
    email: '',
    // currentMode: 'default',
    availableModes: [
      {
        name: 'basic',
        label: 'Syntax check only'
      },
      {
        name: 'default',
        label: 'Syntax check and SMTP validation'
      },
      {
        name: 'extended',
        label: 'Black magic &#174;'
      }
    ]
  };

  // componentDidMount() {
  //   fetch('/api/getUsername')
  //     .then(res => res.json())
  //     .then(user => this.setState({ username: user.username }));
  // }

  getValidation(email, mode) {
    this.setState({
      fetching: true,
      lastReply: null
    }, () => {
      fetch('/api/check', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ email, mode })
      })
        .then(res => res.json())
        .then(
          (res) => {
            this.setState({ fetching: false, lastReply: res });
            // console.log('Result', res);
          }
        )
        .catch(
          (e) => {
            console.error(e);
            this.setState({ fetching: false, });
          }
        );
    });
  }

  makeModeCard(mode) {
    const { email, fetching } = this.state;
    let inputIsValid = 'disabled';
    let textInputIsValid = 'Enter address';
    if (email && email.length > 0 && email.indexOf('@') > -1) {
      inputIsValid = '';
      textInputIsValid = 'Verify address';
    }
    return (
      <div className="card mb-4 box-shadow" key={mode.name}>
        <div className="card-header">
          <h4 className="my-0 font-weight-normal">{uppercaseFirstLetter(mode.name)}</h4>
        </div>
        <div className="card-body">
          <ul className="list-unstyled mt-3 mb-4">
            <li dangerouslySetInnerHTML={{ __html: mode.label }} />
          </ul>
          <button
            type="button"
            className={`btn btn-lg btn-block btn-outline-primary ${inputIsValid}`}
            onClick={() => {
              if (inputIsValid === '' && !fetching) {
                this.getValidation(email, mode.name);
              }
            }}
          >
            {textInputIsValid}
          </button>
        </div>
      </div>
    );
  }

  makeForm() {
    const { email } = this.state;
    return (
      <div className="form-group">
        <input
          type="email"
          className="form-control"
          id="emailAddress"
          aria-describedby="emailHelp"
          placeholder="Enter email to validate"
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            this.setState({ email: val, lastReply: null, fetching: false });
          }}
        />
        <small id="emailHelp" className="form-text text-muted">We&apos;ll never share your email with anyone else.</small>
      </div>
    );
  }

  parseQueueResponse(queueid) {
    return (
      <div className="alert alert-secondary" role="alert">
        <div>
          <div><h5>Patience is a virtue</h5></div>
          <div>
Your request has been queued with id:
            {' '}
            {queueid}
.
            <button
              type="button"
              className="btn btn-block btn-primary mt-2"
              onClick={() => {
                this.setState({
                  fetching: true,
                  lastReply: null
                }, () => {
                  fetch(`/api/queue/${queueid}`, {
                    method: 'GET'
                  })
                    .then(res => res.json())
                    .then(
                      (res) => {
                        this.setState({ fetching: false, lastReply: res });
                        // console.log('Result', res);
                      }
                    )
                    .catch(
                      (e) => {
                        console.error(e);
                        this.setState({ fetching: false });
                      }
                    );
                });
              }}
            >
            Check if it is ready!
            </button>
          </div>
        </div>
      </div>
    );
  }

  parseReply() {
    const { lastReply } = this.state;
    console.log('Parsing last reply', lastReply);
    const {
      queueid,
      response
    } = lastReply;
    if (response) {
      return this.constructor.parseFinalResponse(response);
    }
    return this.parseQueueResponse(queueid);
  }

  render() {
    // const { username } = this.state;
    const {
      fetching,
      availableModes,
      lastReply
    } = this.state;
    return (
      <React.Fragment>
        <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
          <h1 className="display-4">Mail Check</h1>
          <p className="lead">quickly and precisely check any email address.</p>
        </div>
        <div className="container">
          {this.makeForm()}
          {
            fetching
              ? (
                <div className="alert alert-light" role="alert">
                  <div className="d-flex justify-content-center"><div className="spinner-border" role="status" /></div>
                </div>
              )
              : null
          }
          {
            lastReply
              ? this.parseReply()
              : null
          }
          <div className="card-deck mb-3 text-center">
            {
              availableModes.map(v => this.makeModeCard(v))
            }
          </div>
        </div>
        <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
          <h1 className="display-4">Use Mail Check via APIs</h1>
        </div>
        <div className="container">
          <p className="lead">Two separate APIs are available, free of charge!</p>
          <h5><u>Check API</u></h5>
          <dl className="row">
            <dt className="col-sm-3">URL</dt>
            <dd className="col-sm-9">
              {window.location.protocol}
              {'//'}
              {window.location.host}
              {'/api/check'}
            </dd>

            <dt className="col-sm-3">Method</dt>
            <dd className="col-sm-9">POST with url-encoded variables</dd>

            <dt className="col-sm-3">Parameters</dt>
            <dd className="col-sm-9">
              <ul>
                <li>
                  <code>email</code>
                  &nbsp;
                  &mdash;
                  &nbsp;
                  mandatory
                  &nbsp;
                  &mdash;
                  &nbsp;
                  <span>The email address to verify</span>
                </li>
                <li>
                  <code>mode </code>
                  &nbsp;
                  &mdash;
                  &nbsp;
                  optional, defaults to &apos;default&apos;
                  &nbsp;
                  &mdash;
                  &nbsp;
                  <span>
                    &apos;default&apos;, &apos;basic&apos; or &apos;extended&apos;
                  </span>
                </li>
              </ul>
            </dd>

            <dt className="col-sm-3">Reply Mime Type</dt>
            <dd className="col-sm-9"><code>application/json</code></dd>

            <dt className="col-sm-3">Reply definition</dt>
            <dd className="col-sm-9">
              <div>
                In
                {' '}
                <code>basic mode</code>
, you will get your reply in realtime.
                An object will be sent with the following properties:
                <br />
                <pre>
                  {'\r\n'}
                &#x7b;
                  {'\r\n'}
                  {'\t'}
&quot;response&quot;: &#x7b;
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;valid&quot;: true, // or false
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;tests&quot;: [ // the test that were run
                  {'\n'}
                  {'\t'}
                  {'\t'}
                  {'\t'}
&quot;regexp&quot;
                  {'\n'}
                  {'\t'}
                  {'\t'}
],
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;guessedLastName&quot;: &quot;Doe&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;guessedFirstName&quot;: &quot;John&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;email&quot;: &quot;john.doe@gmail.com&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;mode&quot;: &quot;basic&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;confidenceLevel&quot;: 100
                  {'\n'}
                  {'\t'}
                  &#x7d;
                  {'\n'}
&#x7d;
                  {'\n'}
                </pre>
              </div>
              <div>
                In
                {' '}
                <code>default or extended mode</code>
, you will get your reply in queued mode.
                An object will be sent with the following properties:
                <br />
                <pre>
                  {'\r\n'}
                &#x7b;
                  {'\r\n'}
                  {'\t'}
&quot;queued&quot;: true,
                  {'\n'}
                  {'\t'}
&quot;queueid&quot;: &quot;9634hv6kk0uzsvfa&quot;
                  {'\n'}
&#x7d;
                  {'\n'}
                </pre>
                <i>Some extra fields may be present (Black Magic &reg;)</i>
              </div>
            </dd>
            <dt className="col-sm-3">Curl Example</dt>
            <dd className="col-sm-9">
              <code>
curl
                {' '}
                {window.location.protocol}
                {'//'}
                {window.location.host}
                {'/api/check/'}
                {' '}
-H &quot;Content-Type: application/json&quot; -X POST -d &apos;&#x7b;&quot;email&quot;:&quot;john.doe@gmail.com&quot;, &quot;mode&quot;:&quot;default&quot;&#x7d;&apos; -o response.json
              </code>
            </dd>
          </dl>
          <h5><u>Queue API</u></h5>
          <dl className="row">
            <dt className="col-sm-3">URL</dt>
            <dd className="col-sm-9">
              {window.location.protocol}
              {'//'}
              {window.location.host}
              {'/api/queue/'}
              <code>queue_id</code>
            </dd>
            <dt className="col-sm-3">Method</dt>
            <dd className="col-sm-9">GET with variable in PATH</dd>
            <dt className="col-sm-3">Reply Mime Type</dt>
            <dd className="col-sm-9"><code>application/json</code></dd>
            <dt className="col-sm-3">Reply definition</dt>
            <dd className="col-sm-9">
              <div>
                <code>If queued request has been processed</code>
                {' '}
you will receive an object with the following properties:
                <br />
                <pre>
                  {'\r\n'}
                &#x7b;
                  {'\r\n'}
                  {'\t'}
&quot;response&quot;: &#x7b;
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;valid&quot;: true, // or false
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;tests&quot;: [ // the test that were run
                  {'\n'}
                  {'\t'}
                  {'\t'}
                  {'\t'}
&quot;regexp&quot;
                  {'\n'}
                  {'\t'}
                  {'\t'}
],
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;guessedLastName&quot;: &quot;Doe&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;guessedFirstName&quot;: &quot;John&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;email&quot;: &quot;john.doe@gmail.com&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;mode&quot;: &quot;basic&quot;,
                  {'\n'}
                  {'\t'}
                  {'\t'}
&quot;confidenceLevel&quot;: 100
                  {'\n'}
                  {'\t'}
                  &#x7d;
                  {'\n'}
&#x7d;
                  {'\n'}
                </pre>
                <i>Some extra fields may be present (Black Magic &reg;)</i>
              </div>
              <div>
                <code>If queued request has not been processed</code>
                {' '}
you will receive an object with the following properties
                <br />
                <pre>
                  {'\r\n'}
                &#x7b;
                  {'\r\n'}
                  {'\t'}
&quot;queued&quot;: true,
                  {'\n'}
                  {'\t'}
&quot;queueid&quot;: &quot;9634hv6kk0uzsvfa&quot;
                  {'\n'}
&#x7d;
                  {'\n'}
                </pre>
              </div>
            </dd>
            <dt className="col-sm-3">Lifetime</dt>
            <dd className="col-sm-9">Queued results are kept in memory for 500 seconds and deleted once consumed. You cannot access the same queue result twice!</dd>
            <dt className="col-sm-3">Curl Example</dt>
            <dd className="col-sm-9">
              <code>
curl
                {' '}
                {window.location.protocol}
                {'//'}
                {window.location.host}
                /api/queue/askdaskas11sasa -o response.json
              </code>
            </dd>
          </dl>
        </div>
      </React.Fragment>
    );
  }
}
