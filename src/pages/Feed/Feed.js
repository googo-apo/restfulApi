import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';
import 'bootstrap/dist/css/bootstrap.min.css'

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false,
    users: [],
    userEdittingEmail: '',
    userEditting: {}
  };

  componentDidMount() {
    fetch('http://localhost:8081/users', {
      method: 'GET',
      headers: {
        // Authorization: 'Bearer ' + this.props.token
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({ users: resData});
      })
      .catch(this.catchError);
  }

  addPost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (prevState.posts.length >= 2) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1
      };
    });
  };

  updatePost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
      if (updatedPostIndex > -1) {
        updatedPosts[updatedPostIndex] = post;
      }
      return {
        posts: updatedPosts
      };
    });
  };

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
    fetch('http://localhost:8080/feed/posts?page=' + page, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch posts.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          posts: resData.posts.map(post => {
            return{
              ...post,
              imagePath: post.imageUrl
            };
          }),
          totalPosts: resData.totalItems,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    fetch('http://localhost:8080/auth/status', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({
        status: this.state.status
      })
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image);
    let url = 'http://localhost:8080/feed/post';
    let method = 'POST';
    if (this.state.editPost) {
      url = 'http://localhost:8080/feed/post/' + this.state.editPost._id;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      body: formData,
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Creating or editing a post failed!');
        }
        return res.json();
      })
      .then(resData => {
        const post = {
          _id: resData.post._id,
          title: resData.post.title,
          content: resData.post.content,
          creator: resData.post.creator,
          createdAt: resData.post.createdAt
        };
        this.setState(prevState => {          
          return {
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  generateUserTabel =  () => {
    if(this.state.users == null) return
    return this.state.users.map((each,i) => {
      return <tr key={i}>
        <td>{each.email}</td>
        <td>{each.name}</td>
        <td>{each.status}</td>
        <td><button className="btn btn-danger" onClick={()=>this.delUserTable(each.email)}>remove</button></td>
        <td><button className="btn btn-warning" onClick={()=>this.editUserTable(each.email, each.name, each.status)}>Edit</button></td>
      </tr>;
    })
  }

  generateUserEditCom = () => {
      return <div className="container">
                <input type="text" defaultValue={this.state.userEditting.email} name="email" onChange={e=>this.onChangeEditting(e, "email")} />
                <input type="text" defaultValue={this.state.userEditting.name} name="name" onChange={e=>this.onChangeEditting(e, "name")} />
                <input type="text" defaultValue={this.state.userEditting.status} name="status" onChange={e=>this.onChangeEditting(e, "status")} />
                <button className="btn btn-success" onClick={()=>this.editUser(this.state.userEdittingEmail)}>edit</button>
             </div>
  }

  onChangeEditting = (e, element)=>{
    console.log(e.target.value)
    if(element == "email") this.setState({userEditting: {...this.state.userEditting, email: e.target.value}})
    if(element == "name") this.setState({userEditting: {...this.state.userEditting, name: e.target.value}})
    if(element == "status") this.setState({userEditting: {...this.state.userEditting, status: e.target.value}})
  }

  editUserTable = (email, name, status)=>{
    this.setState({userEdittingEmail: email})
    this.setState({userEditting : {email, name, status}});
  }

  editUser = (email) => {
    console.log(this.state.userEditting, email)
    this.setState({userEdittingEmail: ''})
    fetch('http://localhost:8081/users/' + email, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      },
      body: JSON.stringify({
        email: this.state.userEditting.email,
        status: this.state.userEditting.status,
        name: this.state.userEditting.name
      })
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        if(resData.err){
          alert(resData.err)
          return
        }
        let tmpUser = this.state.users
        console.log(tmpUser)
        if(tmpUser){
          tmpUser = tmpUser.filter(t => t.email !== resData.email)
          this.setState({users: tmpUser})
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  }

  delUserTable = (email) => {
    this.setState({userEdittingEmail: ''})
    fetch('http://localhost:8081/users/' + email, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        if(resData.err){
          alert(resData.err)
          return
        }
        let tmpUser = this.state.users
        console.log(tmpUser)
        if(tmpUser){
          tmpUser = tmpUser.filter(t => t.email !== resData.email)
          this.setState({users: tmpUser})
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  }

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        {this.state.userEdittingEmail && this.generateUserEditCom()}
        <section className="feed__status">
          <table className = "table">
            <thead>
              <tr>
                <th>email</th>
                <th>name</th>
                <th>state</th>
                <th>remove</th>
                <th>edit</th>
              </tr>
            </thead>
            <tbody>
              {this.generateUserTabel()}
            </tbody>
          </table>
        </section>

        <section className="feed">
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 3)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>

      </Fragment>
    );
  }
}

export default Feed;
