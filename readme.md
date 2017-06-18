# A Simple React Validator

This is a simple rather beginner approach to validate react form.

#### Disclaimer
Don't use this Validator in Production, This Validator is still in testing and development phase.


#### Installation

`npm install srvalidator`

#### Supported Rules
* required
* email
* int
* array
* min:3
* max:10
* gte:20
* lte:30
* url

#### Usage

```javascript
import React, {Component} from 'react';
import v from 'srvalidator';

class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            v,
            form: {
                first_name: '',
                last_name: '',
                email: '',
                age: '',

            },
            rules: {
                first_name: 'required|min:3',
                last_name: 'required|min:3',
                email: 'required|email',
                age: 'required|int|gte:18',
            }
        };

        this.onChange = this.onChange.bind(this);
        this.validateAndSubmit = this.validateAndSubmit.bind(this);
    }

    onChange(e) {
        const {form, rules} = this.state;
        form[e.target.name] = e.target.value;

        this.state.v.validate(form, rules);

        this.setState({form});
    }

    getError(name) {
        return this.state.v.first(name);
    }

    validateAndSubmit(e) {
        const {form, rules} = this.state;
        this.state.v.validate(form, rules);

        if (!this.state.v.isValid()) {
            alert('Form is not valid.');
            return;
        }

        alert('Submitting Form.');
    }

    render() {
        const {form} = this.state;

        return (
            <div className="Form">

                <div className={'Form-group ' + (!this.getError('first_name') ? '' : 'Has-error')}>
                    <label htmlFor="first_name">First Name (required|min:3)</label>
                    <input type="text" name="first_name" className="Form-control" value={form.first_name}
                           onChange={this.onChange}/>
                    <span className="Help-block">{this.getError('first_name')}</span>
                </div>

                <div className={'Form-group ' + (!this.getError('last_name') ? '' : 'Has-error')}>
                    <label htmlFor="last_name">Last Name (required|min:3)</label>
                    <input type="text" name="last_name" className="Form-control" value={form.last_name}
                           onChange={this.onChange}/>
                    <span className="Help-block">{this.getError('last_name')}</span>
                </div>

                <div className={'Form-group ' + (!this.getError('email') ? '' : 'Has-error')}>
                    <label htmlFor="email">Email (required|email)</label>
                    <input type="text" name="email" className="Form-control" value={form.email}
                           onChange={this.onChange}/>
                    <span className="Help-block">{this.getError('email')}</span>
                </div>

                <div className={'Form-group ' + (!this.getError('age') ? '' : 'Has-error')}>
                    <label htmlFor="age">Age (required|int|gte:18)</label>
                    <input type="text" name="age" className="Form-control" value={form.age}
                           onChange={this.onChange}/>
                    <span className="Help-block">{this.getError('age')}</span>
                </div>

                <div className="Form-group">
                    <button name="submit" className="btn btn-default" onClick={this.validateAndSubmit}>Submit</button>
                </div>


            </div>
        )
    }
}

export default Form;

```

#### TODO
1. Return Promise at validate.
2. Add Confirm Validator
3. Refactor the code.
4. Add Language support.

#### Contact
<a href="mailto://rehan_manzoor@outlook.com">rehan_manzoor@outlook.com</a>