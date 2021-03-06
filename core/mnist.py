from tensorflow.examples.tutorials.mnist import input_data
mnist = input_data.read_data_sets('MNIST_data', one_hot=True)

import sys, json, math, numpy as np
import time

#print(np.get_include())

import tensorflow as tf
print(tf.__version__)
sess = tf.InteractiveSession()

print('python neural network started')
startTime = time.time()

class Network:
    def __init__(self, learningRate, epochs, batchSize, regParam, costFunctionType, hiddenLayers):
        self.learningRate = learningRate
        self.epochs = int(epochs)
        self.batchSize = int(batchSize)
        self.regParam = regParam
        self.costFunctionType = int(costFunctionType)
        self.hiddenLayers = hiddenLayers

def shuffle(a, b):
    assert len(a) == len(b)
    p = np.random.permutation(len(a))
    return a[p], b[p]

def variable_summaries(var):
    """Attach a lot of summaries to a Tensor (for TensorBoard visualization)."""

    with tf.name_scope('summaries'):
      mean = tf.reduce_mean(var)
      tf.summary.scalar('mean', mean)
      stddev = tf.sqrt(tf.reduce_mean(tf.square(var - mean)))
      tf.summary.scalar('stddev', stddev)
      tf.summary.scalar('max', tf.reduce_max(var))
      tf.summary.scalar('min', tf.reduce_min(var))
      tf.summary.histogram('histogram', var)

def get_cost_function(y_, y):
    if network.costFunctionType == 1:
        return tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels=y_, logits=y)) #softmax cross entrophy
    if network.costFunctionType == 2:
        return tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(labels=y_, logits=y)) #sigmoid cross entrophy, 1 class only
    if network.costFunctionType == 3:
        return tf.reduce_mean(tf.square(y_ - y)) #linear regression

def get_accuracy_function(y_, y):
    if network.costFunctionType == 1:
        correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
        return tf.reduce_mean(tf.cast(correct_prediction, tf.float32))
    else:
        error_percentage = tf.abs(tf.divide(tf.subtract(y_, y), y_)) #MAPE accuracy, mean absolute percentage error
        return 1 - tf.reduce_mean(error_percentage)

def create_weights(num_inputs, num_nodes, name):
    weights = tf.Variable(tf.random_normal([num_inputs, num_nodes], stddev=(1/math.sqrt(num_inputs))), name=('weights_' + name))
    with tf.name_scope('weights'):
        variable_summaries(weights)
    return weights

def create_bias(num_nodes, name):
    bias = tf.Variable(tf.random_normal([num_nodes], stddev=1.0), name=('bias_' + name))
    with tf.name_scope('biases'):
        variable_summaries(bias)
    return bias

def create_layer(input_layer, num_nodes, name, is_output_layer=None):
    with tf.name_scope("layer_" + name):
        num_inputs = int(input_layer.shape[1]) #needed because input layer shape must be casted
        weights = create_weights(num_inputs, num_nodes, name)
        bias = create_bias(num_nodes, name)

        with tf.name_scope("activation_" + name):
            layer = tf.matmul(input_layer, weights) + bias

            if is_output_layer is None:
                layer = tf.nn.relu(layer)
            else:
                if network.costFunctionType != 3:
                    layer = tf.sigmoid(layer)

            variable_summaries(layer)

    return layer

def normalize(a):
    print("normalizing training data")
    a = (a - a.mean(axis=0)) / a.std(axis=0)
    return a

def run(np_input, np_labels, percentTestData, learningRate, epochs, batchSize, regParam, costFunctionType, hiddenLayers, normalizeInput=True):
    global network
    network = Network(learningRate, epochs, batchSize, regParam, costFunctionType, hiddenLayers)
    print(percentTestData)
    print("{0} {1} {2} {3} {4} {5}".format(network.learningRate, network.epochs, network.batchSize, network.regParam, network.costFunctionType, network.hiddenLayers))

    num_feat = np_input.shape[1]
    num_cls = np_labels.shape[1]

    if normalizeInput:
        np_input = normalize(np_input)

    numInputs = len(np_input)
    cutoff = math.floor(numInputs * (1 - percentTestData))
    print(numInputs, cutoff)

    np_input_test = np_input[cutoff:numInputs:1]
    np_labels_test = np_labels[cutoff:numInputs:1]
    np_input = np_input[0:cutoff:1]
    np_labels = np_labels[0:cutoff:1]

    print(np_input.shape)
    print(np_labels.shape)
    print(np_input_test.shape)
    print(np_labels_test.shape)

    #with tf.name_scope('input'):
    #    tf.summary.image('input', np_input, 10)

    # build graph
    x = tf.placeholder(tf.float32, shape=[None, num_feat])
    y_ = tf.placeholder(tf.float32, shape=[None, num_cls])
    print("tensorflow graph defined")

    with tf.name_scope("input"):
        variable_summaries(x)

    with tf.name_scope("labels"):
        variable_summaries(y_)
        with tf.name_scope('summaries'):
            y_col = tf.slice(y_, [0, 0], [-1, 1])
            y_win = tf.reduce_mean(tf.cast(y_col, tf.float32))
            tf.summary.scalar('win_percentage', y_win)
            
    input_layer = x

    for i in range(len(hiddenLayers)):
        input_layer = create_layer(input_layer, hiddenLayers[i], str(i))

    y = create_layer(input_layer, num_cls, 'output', True)

    with tf.name_scope("layer_output"):
        with tf.name_scope('summaries'):
            ycol = tf.slice(y, [0, 0], [-1, 1])
            ywin = tf.reduce_mean(tf.cast(ycol, tf.float32))
            tf.summary.scalar('win_percentage', ywin)

            ycol = tf.slice(y, [0, 1], [-1, 1])
            ywin = tf.reduce_mean(tf.cast(ycol, tf.float32))
            tf.summary.scalar('lose_percentage', ywin)

    print("layers created")
    
    with tf.name_scope('cost_function'):
        cost_function = get_cost_function(y_, y)
        tf.summary.scalar('cost_function', cost_function)

    train_step = tf.train.GradientDescentOptimizer(network.learningRate).minimize(cost_function)

    with tf.name_scope('accuracy'):
        accuracy = get_accuracy_function(y_, y)
        tf.summary.scalar('accuracy', accuracy)

    merged = tf.summary.merge_all()
    train_writer = tf.summary.FileWriter('../network/tensorboard/train', sess.graph)
    test_writer = tf.summary.FileWriter('../network/tensorboard/test')

    #sess.run(tf.global_variables_initializer())
    tf.global_variables_initializer().run()

    #run loops and train!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    numInputs = len(np_input) #or np_input.shape[0]
    loops = math.ceil(numInputs / batchSize)
    epochs = network.epochs

    for i in range(loops * epochs):
        try:
            start = (i % loops) * network.batchSize
            end = start + network.batchSize
            end = end if end < numInputs else numInputs

            if start == 0:
                np_input, np_labels = shuffle(np_input, np_labels)
                print('epochs left: {}'.format(epochs))
                epochs = epochs - 1

            #train_step.run(feed_dict={x: np_input[start:end:1], y_: np_labels[start:end:1]})
            
            if i == 0 or i % 10 == 0:
                summary, acc = sess.run([merged, accuracy], feed_dict={x: np_input_test, y_: np_labels_test})
                print('Accuracy at step ' + str(i) + ': ' + str(acc))
                test_writer.add_summary(summary, i)
            else:
                summary, _ = sess.run([merged, train_step], feed_dict={x: np_input[start:end:1], y_: np_labels[start:end:1]})
                train_writer.add_summary(summary, i)
        except OSError as err:
            print("OS error: {0}".format(err))
        except ValueError:
            print("Could not convert data to an integer.")
        except NameError as err:
            print("Name error: {0}".format(err))
        except:
            print("Unexpected error:", sys.exc_info()[0])
            raise
            
    print('time: ' + str(time.time() - startTime))

    #print(accuracy.eval(feed_dict={x: np_input_test, y_: np_labels_test}))
    summary, acc = sess.run([merged, accuracy], feed_dict={x: np_input_test, y_: np_labels_test})
    print('Test Accuracy: ' + str(acc))

    summary, acc = sess.run([merged, accuracy], feed_dict={x: np_input, y_: np_labels})
    print('Train Accuracy: ' + str(acc))
    #test_writer.add_summary(summary, 0)

    return 1

def run_mnist():
    print('running mnist')
    run(np.concatenate((mnist.train.images, mnist.test.images)), np.concatenate((mnist.train.labels, mnist.test.labels)), .2, .5, 30, 100, 0, 1, [100], False)
    return 1

run_mnist()