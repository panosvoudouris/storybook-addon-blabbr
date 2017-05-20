import React from 'react';
import PropTypes from 'prop-types';

class StoryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.showComments = this.showComments.bind(this);

    this.state = {
      commentCount: 0,
    };
  }

  showComments() {
    this.props.channel.emit('blabbrFocusTab');
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
    // Reenable this when we have a valid style
        // <button
        //   type="button"
        //   className="btn btn-default"
        //   onClick={this.showComments}
        //   style={{
        //     position: 'fixed',
        //     top: '0',
        //     right: '0',
        //     display: 'block',
        //   }}
        // >
        //   <span className="glyphicon glyphicon-comment" />
        // </button>
    //   </div>
    // );
  }
}

StoryWrapper.propTypes = {
  channel: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default StoryWrapper;
