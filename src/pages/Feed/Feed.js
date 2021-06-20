import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';
import { connect } from 'react-redux'

import { getUserLists, delUserTable, editUser, IsEditting } from '../../actions/userAction'

import Post from '../../components/Feed/Post/Post';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Paginator from '../../components/Paginator/Paginator';
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
    this.props.getUserLists()
  }

  componentWillReceiveProps(next) {
    console.log(next)
    let editingUser = {}
    if(next && next.users && next.users.editingUser && next.users.editingUser !== {}){
      editingUser = {
        email:next.users.editingUser.email,
        name:next.users.editingUser.name,
        status:next.users.editingUser.status
      }
    }
    this.setState({userEditting: editingUser})
  }

  errorHandler = () => {
    this.setState({ error: null });
  };

  generateUserTabel =  () => {
    if(this.props.users.users == null) return
    return this.props.users.users.map((each,i) => {
      return <tr key={i}>
        <td>{each.email}</td>
        <td>{each.name}</td>
        <td>{each.status}</td>
        <td><button className="btn btn-danger" onClick={()=>this.props.delUserTable(each.email, this.props.token)}>remove</button></td>
        <td><button className="btn btn-warning" onClick={()=>this.editUserTable(true, each)}>Edit</button></td>
      </tr>;
    })
  }

  generateUserEditCom = () => {
      return <div style = {{}}>
                <input type="text" defaultValue={this.state.userEditting.email} name="email" onChange={e=>this.onChangeEditting(e, "email")} className="inputTag emailTag"/>
                <input type="text" defaultValue={this.state.userEditting.name} name="name" onChange={e=>this.onChangeEditting(e, "name")} style={{margineRight:'10px'}}className="inputTag" />
                <input type="text" defaultValue={this.state.userEditting.status} name="status" onChange={e=>this.onChangeEditting(e, "status")} style={{margineRight:'10px'}} className="inputTag"/>
                <button className="btn btn-info" onClick={()=>this.props.editUser(this.props.users.editingUser.email, this.props.token, this.state.userEditting)} style={{marginRight:'10px'}}>edit</button>
                <button className="btn btn-danger" onClick={()=>this.canceledit(this.state.userEdittingEmail)}>cancel</button>
             </div>
  }

  onChangeEditting = (e, element)=>{
    console.log(e.target.value)
    if(element == "email") this.setState({userEditting: {...this.state.userEditting, email: e.target.value}})
    if(element == "name") this.setState({userEditting: {...this.state.userEditting, name: e.target.value}})
    if(element == "status") this.setState({userEditting: {...this.state.userEditting, status: e.target.value}})
  }

  editUserTable = (cond, user)=>{
    this.props.IsEditting(cond, user)
  }

  canceledit = () => {
    this.props.IsEditting(false, null)
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
        <section className="feed__status">
        {this.props.users.isEditting && this.generateUserEditCom()}
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

const mapStateToProps = (state) => {
  return {
      users: state.userStore
  }
}

export default connect(mapStateToProps, { getUserLists, delUserTable, editUser, IsEditting })(Feed)
