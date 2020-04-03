import React, {Component} from 'react';
import Navigation from './component/navigation/Navigation';
import Signin from './component/signin/Signin';
import Register from './component/register/Register';
import Logo from './component/logo/Logo';
import ImageLinkForm from './component/imageLinkForm/ImageLinkForm';
import './App.css';
import Rank from './component/rank/Rank';
import FaceRecognition from './component/faceRecognition/FaceRecognition';
import 'tachyons';
import Particles from 'react-particles-js';

const particlesOptions = {
  particles:{
    number:{
      value: 80,
      density: {
        enable: true,
        value_area: 800,
      }
    }
  }
}

const initialState = {
  input:'',
  imageURL:'',
  box:{},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}
class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }
  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;       
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
    console.log(box);
    this.setState({box: box})
  }
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () =>{
    this.setState({imageURL:this.state.input});
    
    fetch('https://git.heroku.com/protected-bastion-23558.git/imageurl',{
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      if (response){
        fetch('https://git.heroku.com/protected-bastion-23558.git:3000/image',{
          method: 'put',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            id:this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count }))
        })
        .catch (console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route:route});
  }

  render(){
    return (
      <div className="App">
        <Particles className='particles'
        params={particlesOptions}
         />
         
         <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home' 
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}
                />
              <FaceRecognition box={this.state.box} imageURL={this.state.imageURL}/>
            </div>
          : (
              this.state.route === 'signin'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
          
          
        }
      </div>
    );
  }
}

export default App;