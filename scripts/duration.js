var H5PEditor = H5PEditor || {};

/**
 * Duration widget module
 *
 * @param {jQuery} $
 */
H5PEditor.widgets.duration = H5PEditor.Duration = (function ($) {

  /**
   * Creates a time picker.
   *
   * @param {mixed} parent
   * @param {object} field
   * @param {mixed} params
   * @param {function} setValue
   * @returns {C}
   */
  function C(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
  };

  /**
   * Append the field to the wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  C.prototype.appendTo = function ($wrapper) {
    var that = this;

    this.$item = $(this.createHtml()).appendTo($wrapper);
    this.$inputs = this.$item.find('input');
    this.$errors = this.$item.children('.errors');

    this.$inputs.change(function () {
      // Validate
      var value = that.validate();

      if (value) {
        // Set param
        that.params = value;
        that.setValue(that.field, value);
      }
    }).click(function () {
      return false;
    });
  };

  /**
   * Creates HTML for the widget.
   */
  C.prototype.createHtml = function () {
    var input = H5PEditor.createText(this.params !== undefined ? C.humanizeTime(this.params.from) : undefined, 15, 'From') + ' - ' + H5PEditor.createText(this.params !== undefined ? C.humanizeTime(this.params.to) : undefined, 15, 'To');
    var label = H5PEditor.createLabel(this.field, input);

    return H5PEditor.createItem(this.field.widget, label, this.field.description);
  };

  /**
   * Validate the current values.
   */
  C.prototype.validate = function () {
    var that = this;
    var duration = {};

    this.$inputs.each(function (i) {
      var $input = $(this);
      var values = H5P.trim($input.val()).split(':', 3);
      var field = that.field.fields[i];

      for (var j = 0; j < values.length; j++) {
        var value = values[j];
        if ((that.field.optional === undefined || !that.field.optional) && !value.length) {
          that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'requiredProperty', {':property': field.name})));
          return false;
        }
        else if (!value.match(new RegExp('^[0-9]+$'))) {
          that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'onlyNumbers', {':property': field.name})));
          return false;
        }
      }

      j--;
      value = parseInt(values[j]);
      j--;
      if (values[j] !== undefined) {
        // Add minutes
        value += values[j] * 60;
      }
      j--;
      if (values[j] !== undefined) {
        // Add hours
        value += values[j] * 3600;
      }

      if (field.max !== undefined && value > field.max) {
        that.$errors.append(H5PEditor.createError(H5PEditor.t('core', 'exceedsMax', {':property': field.name, ':max': field.max})));
        return false;
      }
      else if (field.min !== undefined && value < field.min) {
        that.$errors.append(H5PEditor.createError(C.t('exceedsMin', {':property': field.name, ':min': field.min})));
        return false;
      }

      duration[field.name] = value;
    });

    if (duration.from > duration.to) {
      this.$errors.append(H5PEditor.createError(C.t('fromBiggerThanTo')));
    }

    return H5PEditor.checkErrors(this.$errors, this.$inputs, duration);
  };

  /**
   * Remove this item.
   */
  C.prototype.remove = function () {
    this.$item.remove();
  };

  /**
   * Local translate function.
   *
   * @param {Atring} key
   * @param {Object} params
   * @returns {@exp;H5PEditor@call;t}
   */
  C.t = function (key, params) {
    return H5PEditor.t('H5PEditor.Duration', key, params);
  };

  /**
   * Formats time in H:MM:SS.
   *
   * @param {float} seconds
   * @returns {string}
   */
  C.humanizeTime = function (seconds) {
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);

    minutes = minutes % 60;
    seconds = Math.floor(seconds % 60);

    var time = '';

    if (hours !== 0) {
      time += hours + ':';

      if (minutes < 10) {
        time += '0';
      }
    }

    time += minutes + ':';

    if (seconds < 10) {
      time += '0';
    }

    time += seconds;

    return time;
  };

  return C;
})(H5P.jQuery);

// Default english translations
H5PEditor.language['H5PEditor.Duration'] = {
  libraryStrings: {
    exceedsMin: '":property" exceeds minimum value of :min.',
    fromBiggerThanTo: '"From" must be earlier than "To".'
  }
};