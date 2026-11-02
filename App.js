import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  Provider as PaperProvider,
  Button,
  TextInput,
  Card,
  Menu,
  DefaultTheme,
  configureFonts
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Font 
const fontConfig = {
  regular: {
    fontFamily: 'ArialRoundedMTBold',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'ArialRoundedMTBold',
    fontWeight: 'normal',
  }
};

// Theme 
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    accent: '#FFC107',
    background: '#0B999A',
    surface: '#FFFFFF',
    text: '#212121',
    placeholder: '#9E9E9E'
  },
  fonts: configureFonts({ default: fontConfig }),
};

// Home Screen
function HomeScreen({ navigation }) {
  return (
    <View style={styles.homeContainer}>
      <Text style={styles.title}>Personal Budget Manager App</Text>
      <Text style={styles.subtitle}>Track your expenses and income</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Transactions')}
        style={styles.getStartedButton}
        labelStyle={styles.buttonLabel}>
        Start Tracking
      </Button>
    </View>
  );
}

// Transactions Screen
function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [visible, setVisible] = useState(false);

  const categories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Salary'];
  const transactionTypes = ['expense', 'income'];

  const addTransaction = () => {
    if (!amount) return;

    const newTransaction = {
      id: Date.now().toString(),
      amount: type === 'income' ? Math.abs(parseFloat(amount)) : -Math.abs(parseFloat(amount)),
      description,
      category,
      type,
      date: new Date().toISOString()
    };

    setTransactions([...transactions, newTransaction]);
    setAmount('');
    setDescription('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getBalance = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getSummaryByCategory = () => {
    const summary = {};
    transactions.forEach(({ category, amount }) => {
      if (!summary[category]) summary[category] = 0;
      summary[category] += amount;
    });
    return summary;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Card style={styles.summaryCard}>
          <Text style={styles.balanceText}>
            Current Balance:{' '}
            <Text style={{ color: getBalance() >= 0 ? '#4CAF50' : '#F44336' }}>
              ${Math.abs(getBalance()).toFixed(2)}
            </Text>
          </Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.balanceText}>Summary by Category:</Text>
          {Object.entries(getSummaryByCategory()).map(([cat, amt]) => (
            <Text key={cat} style={styles.balanceText}>
              {cat}:{' '}
              <Text style={{ color: amt >= 0 ? '#4CAF50' : '#F44336' }}>
                ${Math.abs(amt).toFixed(2)}
              </Text>
            </Text>
          ))}
        </Card>

        <Card style={styles.inputCard}>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            theme={theme}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            theme={theme}
          />

          <View style={styles.typeContainer}>
            {transactionTypes.map(t => (
              <Button
                key={t}
                mode={type === t ? 'contained' : 'outlined'}
                onPress={() => setType(t)}
                style={[
                  styles.typeButton,
                  type === t && styles.selectedType
                ]}
                labelStyle={[
                  styles.typeButtonLabel,
                  type === t && styles.selectedTypeLabel
                ]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </View>

          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <Button
                onPress={() => setVisible(true)}
                style={styles.categoryButton}
                labelStyle={styles.buttonLabel}
                contentStyle={{ justifyContent: 'space-between' }}
                icon={visible ? 'chevron-up' : 'chevron-down'}>
                {category}
              </Button>
            }>
            {categories.map((cat) => (
              <Menu.Item
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setVisible(false);
                }}
                title={cat}
              />
            ))}
          </Menu>

          <Button
            mode="contained"
            onPress={addTransaction}
            style={styles.addButton}
            labelStyle={styles.buttonLabel}>
            Add Transaction
          </Button>
        </Card>

        <View style={{ marginBottom: 50 }}>
          <FlatList
            data={[...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.transactionCard}>
                <Card.Title
                  title={item.description || 'No description'}
                  titleStyle={styles.transactionTitle}
                  subtitle={`${item.category} • ${new Date(item.date).toLocaleDateString()}`}
                  subtitleStyle={styles.transactionSubtitle}
                  left={() => (
                    <View style={[
                      styles.typeIndicator,
                      { backgroundColor: item.type === 'income' ? '#4CAF50' : '#F44336' }
                    ]} />
                  )}
                  right={() => (
                    <View style={styles.transactionRight}>
                      <Text style={[
                        styles.amountText,
                        { color: item.type === 'income' ? '#4CAF50' : '#F44336' }
                      ]}>
                        {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                      </Text>
                      <Button
                        onPress={() => deleteTransaction(item.id)}
                        style={[styles.deleteButton, { backgroundColor: 'transparent' }]}>
                        <Text style={styles.deleteText}>×</Text>
                      </Button>
                    </View>
                  )}
                />
              </Card>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={{
        colors: {
          primary: '#4CAF50',
          background: '#0B999A',
          card: '#FFFFFF',
          text: '#212121',
          border: '#BDBDBD',
        }
      }}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: 'rgba(76, 175, 80, 0.8)',
              elevation: 0,
              shadowOpacity: 0
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontFamily: 'ArialRoundedMTBold',
              fontSize: 20
            },
            headerTitleAlign: 'center'
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Transactions"
            component={TransactionsScreen}
            options={{
              title: 'Budget Manager'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B999A',
    padding: 20
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    marginBottom: 10,
    fontFamily: 'ArialRoundedMTBold',
    textAlign: 'center'
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    marginBottom: 30,
    fontFamily: 'ArialRoundedMTBold',
    textAlign: 'center'
  },
  getStartedButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderRadius: 25,
    paddingVertical: 8,
    width: 200,
    elevation: 2
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#0B999A'
  },
  summaryCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    alignItems: 'center'
  },
  balanceText: {
    fontSize: 16,
    fontFamily: 'ArialRoundedMTBold',
    color: '#212121'
  },
  inputCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent'
  },
  selectedType: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)'
  },
  typeButtonLabel: {
    color: '#4CAF50',
    fontFamily: 'ArialRoundedMTBold'
  },
  selectedTypeLabel: {
    color: '#FFFFFF'
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
    borderRadius: 25,
    marginBottom: 15
  },
  addButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderRadius: 25,
    marginTop: 5
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 16
  },
  transactionCard: {
    marginVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    overflow: 'hidden'
  },
  typeIndicator: {
    width: 5,
    height: '100%',
    marginRight: 10
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  transactionTitle: {
    color: '#212121',
    fontFamily: 'ArialRoundedMTBold'
  },
  transactionSubtitle: {
    color: '#757575',
    fontFamily: 'ArialRoundedMTBold'
  },
  amountText: {
    paddingRight: 10,
    fontFamily: 'ArialRoundedMTBold',
    fontSize: 16
  },
  deleteButton: {
    minWidth: 30,
    height: 30,
    borderRadius: 15
  },
  deleteText: {
    color: '#F44336',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20
  }
});

//I chose a modern and friendly color palette, incorporating vibrant tones like teal, green, yellow It was inspired by the banking app I use in South Africa (FNB). I also used grenfor positive actions and red for expenses, enhancing the user experience with intuitive visual cues.  I also used rounded corners and semi-transparent cards were used to give a clean and soft aesthetic. The font choice was “ArialRoundedMTBold” all round to maintain a consistent, approachable tone.I implemented category filtering through a dropdown and allowed users to toggle between expense and income with clearly styled buttons. A major challenge was configuring dependencies correctly, especially when setting up the JSON file and integrating the React Navigation system I had to update alot. I also faced issues with dropdown menus only showing the “Food” category initially, which was resolved by ensuring all categories were properly listed. Another problem was the inability to scroll within the app, which I fixed by ensuring all screen content was wrapped in a ScrollView with adequate padding and flexGrow. There were also errors with iOS and Android connections, but these were resolved by restarting the build environments and rechecking configuration files. Overall, the app now provides a responsive and user-friendly interface for managing personal finances effectively.

